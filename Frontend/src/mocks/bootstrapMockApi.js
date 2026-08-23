import { apiClient } from '@/utils/apiClient';
import { clearAuthData, getAccessToken } from '@/utils/authStorage';
import mockApiAdapter from '@/mocks/mockApiAdapter';
import { getMockDatabase, persistMockDatabase } from '@/mocks/mockDatabase';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';

const parseBody = (config) => {
  if (config.data == null || config.data === '') return {};
  if (typeof config.data === 'object') return config.data;
  try {
    return JSON.parse(config.data);
  } catch {
    return {};
  }
};

const getParams = (config) => {
  const params = { ...(config.params || {}) };
  const raw = String(config.url || '');
  const query = raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '';
  new URLSearchParams(query).forEach((value, key) => {
    if (params[key] == null) params[key] = value;
  });
  return params;
};

const pageOf = (items, params = {}) => {
  const page = Math.max(0, Number(params.page ?? 0) || 0);
  const size = Math.max(1, Number(params.size ?? 10) || 10);
  const start = page * size;
  const content = items.slice(start, start + size);
  const totalElements = items.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);
  return {
    content,
    number: page,
    page,
    size,
    numberOfElements: content.length,
    totalElements,
    totalPages,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
    empty: content.length === 0,
  };
};

const nextId = (items, floor = 1) => Math.max(floor - 1, ...items.map((item) => Number(item.id) || 0)) + 1;

const mockJwt = (user) => {
  const payload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  };
  return `mock.${window.btoa(JSON.stringify(payload))}.signature`;
};

const mockResponse = (config, data) => ({
  data,
  status: 200,
  statusText: 'OK (Mock)',
  headers: { 'x-hotcinema-mock': 'true' },
  config,
  request: { mock: true },
});

const mockHttpError = (config, status, message) => {
  const error = new Error(message);
  error.config = config;
  error.response = {
    status,
    data: { message },
    headers: { 'x-hotcinema-mock': 'true' },
    config,
  };
  return error;
};

const currentStoredUser = (db) => {
  try {
    const stored = JSON.parse(window.localStorage.getItem('user_info') || 'null');
    if (stored?.id) return db.users.find((item) => String(item.id) === String(stored.id)) || stored;
  } catch {
    // Ignore malformed local development data.
  }
  return db.users.find((item) => item.email === 'customer@hotcinema.vn') || db.users[0];
};

const genreList = (db) => [...new Set(db.movies.flatMap((movie) => movie.genres || []))]
  .sort((left, right) => String(left).localeCompare(String(right), 'vi'))
  .map((name, index) => ({ id: index + 1, name }));

const cinemaDateSchedule = (db, cinemaId, date, params) => {
  const groups = new Map();
  db.showtimes
    .filter((showtime) => showtime.cinemaId === Number(cinemaId) && showtime.showDate === date)
    .forEach((showtime) => {
      const movie = db.movies.find((item) => item.id === showtime.movieId);
      if (!movie) return;

      if (!groups.has(movie.id)) {
        groups.set(movie.id, {
          movieId: movie.id,
          movieTitle: movie.title,
          posterUrl: movie.posterUrl,
          posterPath: movie.posterUrl,
          moviePoster: movie.posterUrl,
          duration: movie.durationMinutes,
          movieDuration: movie.durationMinutes,
          genre: Array.isArray(movie.genres) ? movie.genres.join(', ') : '',
          movieGenre: Array.isArray(movie.genres) ? movie.genres.join(', ') : '',
          formats: [],
        });
      }

      const group = groups.get(movie.id);
      let format = group.formats.find((item) => item.formatType === showtime.format);
      if (!format) {
        format = { formatType: showtime.format, showtimes: [] };
        group.formats.push(format);
      }
      format.showtimes.push({
        id: showtime.id,
        showtimeId: showtime.id,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        roomId: showtime.roomId,
        roomName: showtime.roomName,
        price: showtime.price ?? showtime.basePrice,
        basePrice: showtime.basePrice,
        status: showtime.status,
        format: showtime.format,
      });
    });

  return pageOf([...groups.values()], params);
};

const createMockSeat = (db, body = {}) => {
  const roomId = Number(body.roomId ?? body.theaterId);
  const row = Number(body.row || 1);
  const col = Number(body.col || 1);
  const rowLabel = String(body.rowLabel || String.fromCharCode(64 + Math.min(Math.max(row, 1), 26)));
  const seatType = String(body.seatType || body.type || 'REGULAR').toUpperCase();
  const seatStatus = String(body.seatStatus || body.status || 'AVAILABLE').toUpperCase();
  return {
    id: nextId(db.seats, 1000),
    roomId,
    theaterId: roomId,
    row,
    col,
    rowLabel,
    seatNumber: String(col),
    name: body.name || `${rowLabel}${col}`,
    seatType,
    type: seatType === 'REGULAR' ? 'standard' : seatType.toLowerCase(),
    seatStatus,
    status: seatStatus.toLowerCase(),
    isActive: !['BLOCKED', 'MAINTENANCE', 'UNAVAILABLE'].includes(seatStatus),
    price: Number(body.price || 0),
  };
};

const paymentRows = (db) => db.payments.map((payment) => {
  const booking = db.bookings.find((item) => item.id === payment.bookingId);
  const user = db.users.find((item) => item.id === booking?.userId);
  return {
    ...payment,
    bookingCode: payment.bookingCode || booking?.bookingCode,
    paymentStatus: payment.paymentStatus || payment.status,
    paymentDate: payment.paymentDate || payment.paidAt || payment.createdAt,
    fullName: payment.fullName || user?.fullName,
    email: payment.email || user?.email,
  };
});

const authAwareMockAdapter = async (config) => {
  const method = String(config.method || 'get').toLowerCase();
  const path = String(config.url || '').split('?')[0].replace(/\/$/, '');

  if (method === 'post' && path === '/auths/login') {
    const body = parseBody(config);
    const email = String(body.email || '').trim().toLowerCase();
    const passwords = {
      'admin@hotcinema.vn': 'admin123',
      'customer@hotcinema.vn': 'customer123',
      'staff@hotcinema.vn': 'staff123',
    };
    const db = getMockDatabase();
    const user = db.users.find((item) => String(item.email || '').toLowerCase() === email);

    if (!user || !passwords[email]) {
      throw mockHttpError(config, 401, 'Tài khoản mock không tồn tại. Hãy dùng tài khoản hiển thị ở Frontend test mode.');
    }
    if (body.password !== passwords[email]) {
      throw mockHttpError(config, 401, 'Mật khẩu mock không đúng.');
    }

    return mockResponse(config, {
      accessToken: mockJwt(user),
      refreshToken: 'mock-refresh-token',
      userAuth: user,
    });
  }

  // MovieForm needs the genre catalog even when no dedicated Genres admin page is active.
  if (method === 'get' && (path === '/genres' || path === '/genres/all')) {
    return mockResponse(config, genreList(getMockDatabase()));
  }
  const genreIdMatch = path.match(/^\/genres\/(\d+)$/);
  if (method === 'get' && genreIdMatch) {
    const genre = genreList(getMockDatabase()).find((item) => item.id === Number(genreIdMatch[1]));
    return mockResponse(config, genre || null);
  }
  const genreNameMatch = path.match(/^\/genres\/name\/(.+)$/);
  if (method === 'get' && genreNameMatch) {
    const name = decodeURIComponent(genreNameMatch[1]);
    const genre = genreList(getMockDatabase()).find((item) => item.name.toLowerCase() === name.toLowerCase());
    return mockResponse(config, genre || null);
  }

  // Customer CinemaDetail and Schedule consume a movie-grouped response for this endpoint.
  const cinemaDateMatch = path.match(/^\/showtimes\/cinema\/(\d+)\/date\/([^/]+)$/);
  if (method === 'get' && cinemaDateMatch) {
    const params = getParams(config);
    return mockResponse(
      config,
      cinemaDateSchedule(getMockDatabase(), Number(cinemaDateMatch[1]), decodeURIComponent(cinemaDateMatch[2]), params),
    );
  }

  // SeatManager creates individual seats using theaterId and can generate a room layout in bulk.
  // Normalize both paths to roomId so reloading the seat list immediately reflects the mutation.
  if (method === 'post' && path === '/seats') {
    const db = getMockDatabase();
    const seat = createMockSeat(db, parseBody(config));
    db.seats.push(seat);
    persistMockDatabase();
    return mockResponse(config, seat);
  }
  const bulkSeatMatch = path.match(/^\/seats\/theater\/(\d+)\/create-bulk$/);
  if (method === 'post' && bulkSeatMatch) {
    const db = getMockDatabase();
    const roomId = Number(bulkSeatMatch[1]);
    const params = getParams(config);
    const rows = Math.max(1, Number(params.rows || 8));
    const seatsPerRow = Math.max(1, Number(params.seatsPerRow || 10));
    const created = [];

    for (let row = 1; row <= rows; row += 1) {
      for (let col = 1; col <= seatsPerRow; col += 1) {
        const exists = db.seats.some((seat) => seat.roomId === roomId && Number(seat.row) === row && Number(seat.col) === col);
        if (exists) continue;
        const seat = createMockSeat(db, {
          theaterId: roomId,
          row,
          col,
          name: `${String.fromCharCode(64 + Math.min(row, 26))}${col}`,
          seatType: row >= Math.max(4, rows - 2) ? 'VIP' : 'REGULAR',
          seatStatus: 'AVAILABLE',
        });
        db.seats.push(seat);
        created.push(seat);
      }
    }
    persistMockDatabase();
    return mockResponse(config, created);
  }
  const deleteRoomSeatsMatch = path.match(/^\/seats\/theater\/(\d+)$/);
  if (method === 'delete' && deleteRoomSeatsMatch) {
    const db = getMockDatabase();
    const roomId = Number(deleteRoomSeatsMatch[1]);
    const removed = db.seats.filter((seat) => seat.roomId === roomId);
    db.seats = db.seats.filter((seat) => seat.roomId !== roomId);
    persistMockDatabase();
    return mockResponse(config, removed);
  }

  // Admin payment table expects paymentStatus and customer display fields.
  if (method === 'get' && path === '/payments') {
    return mockResponse(config, pageOf(paymentRows(getMockDatabase()), getParams(config)));
  }
  if (method === 'get' && path === '/payments/all-no-page') {
    return mockResponse(config, paymentRows(getMockDatabase()));
  }

  // notificationService uses POST for read state changes. Keep those mutations
  // persistent so Header and Notifications page remain in sync after reload.
  if (method === 'post' && (path === '/notifications/read-all' || /^\/notifications\/\d+\/read$/.test(path))) {
    const db = getMockDatabase();
    const user = currentStoredUser(db);
    const canSeeAll = String(user?.role || '').toUpperCase() === 'ADMIN';

    if (path === '/notifications/read-all') {
      db.notifications
        .filter((item) => canSeeAll || String(item.userId) === String(user?.id))
        .forEach((item) => {
          item.read = true;
          item.isRead = true;
        });
      persistMockDatabase();
      return mockResponse(config, { success: true });
    }

    const id = Number(path.split('/')[2]);
    const notification = db.notifications.find((item) => item.id === id);
    if (notification) {
      notification.read = true;
      notification.isRead = true;
      persistMockDatabase();
    }
    return mockResponse(config, notification || { success: true });
  }

  return mockApiAdapter(config);
};

if (MOCK_API_ENABLED) {
  apiClient.defaults.adapter = authAwareMockAdapter;

  // A real/expired backend token would make apiClient try the real refresh endpoint
  // before the mock adapter runs. Clear it when switching into mock mode.
  const existingToken = getAccessToken();
  if (existingToken && !String(existingToken).startsWith('mock.')) {
    clearAuthData();
  }

  console.info('[HotCinema] Mock API enabled. No backend connection is required.');
}

export { MOCK_API_ENABLED };
