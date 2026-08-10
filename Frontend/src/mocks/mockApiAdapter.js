import { getMockDatabase, persistMockDatabase } from '@/mocks/mockDatabase';
import { MOCK_API_DELAY } from '@/mocks/mockConfig';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const parseBody = (config) => {
  if (config.data == null || config.data === '') return {};
  if (typeof config.data === 'object') return config.data;
  try {
    return JSON.parse(config.data);
  } catch {
    return config.data;
  }
};

const normalizePath = (config) => {
  const raw = String(config.url || '/');
  try {
    const url = new URL(raw, 'http://mock.local');
    return url.pathname.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  } catch {
    return raw.split('?')[0].replace(/\/+/g, '/').replace(/\/$/, '') || '/';
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
const upper = (value) => String(value || '').trim().toUpperCase();
const lower = (value) => String(value || '').trim().toLowerCase();

const mockJwt = (user) => {
  const payload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  };
  return `mock.${window.btoa(JSON.stringify(payload))}.signature`;
};

const storedUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem('user_info') || 'null');
  } catch {
    return null;
  }
};

const currentUser = (db) => {
  const stored = storedUser();
  if (stored?.id) return db.users.find((item) => String(item.id) === String(stored.id)) || stored;
  return db.users.find((item) => item.email === 'customer@hotcinema.vn') || db.users[0];
};

const cinemaShowtimePage = (db, movieId, date, params) => {
  const movieIdNumber = Number(movieId);
  const cityFilter = params.cityId != null && params.cityId !== '' ? Number(params.cityId) : null;
  const matching = db.showtimes.filter((showtime) => (
    showtime.movieId === movieIdNumber
    && (!date || showtime.showDate === date)
    && (!cityFilter || db.cinemas.find((cinema) => cinema.id === showtime.cinemaId)?.cityId === cityFilter)
  ));

  const byCinema = new Map();
  matching.forEach((showtime) => {
    const cinema = db.cinemas.find((item) => item.id === showtime.cinemaId);
    if (!cinema) return;
    if (!byCinema.has(cinema.id)) {
      byCinema.set(cinema.id, {
        cinemaId: cinema.id,
        cinemaName: cinema.name,
        address: cinema.address,
        cityName: cinema.cityName,
        formats: [],
      });
    }
    const entry = byCinema.get(cinema.id);
    let format = entry.formats.find((item) => item.formatType === showtime.format);
    if (!format) {
      format = { formatType: showtime.format, showtimes: [] };
      entry.formats.push(format);
    }
    format.showtimes.push({
      showtimeId: showtime.id,
      id: showtime.id,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      roomId: showtime.roomId,
      roomName: showtime.roomName,
      price: showtime.basePrice,
      basePrice: showtime.basePrice,
      status: showtime.status,
      format: showtime.format,
    });
  });

  return pageOf([...byCinema.values()], params);
};

const getShowtimeSeats = (db, showtimeId) => {
  const showtime = db.showtimes.find((item) => String(item.id) === String(showtimeId));
  if (!showtime) return [];
  db.showtimeSeatState ||= {};

  return db.seats
    .filter((seat) => seat.roomId === showtime.roomId)
    .map((seat) => {
      const key = `${showtime.id}:${seat.id}`;
      const override = db.showtimeSeatState[key];
      const deterministicBooked = (seat.row === 2 && [3, 4, 7].includes(seat.col)) || (seat.row === 3 && seat.col === 5);
      return {
        ...seat,
        price: seat.type === 'standard' ? showtime.basePrice : seat.type === 'vip' ? showtime.basePrice + 30000 : showtime.basePrice + 80000,
        status: override?.status || (deterministicBooked ? 'booked' : seat.status),
        seatStatus: override?.status || (deterministicBooked ? 'BOOKED' : upper(seat.status)),
        lockedByUserId: override?.lockedByUserId || null,
      };
    });
};

const revenueSummary = (db) => {
  const successful = db.payments.filter((payment) => payment.status === 'SUCCESS');
  const pending = db.payments.filter((payment) => payment.status === 'PENDING');
  const failed = db.payments.filter((payment) => ['FAILED', 'CANCELLED'].includes(payment.status));
  return {
    totalRevenue: successful.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    totalBookings: db.bookings.length,
    totalTickets: db.bookings.reduce((sum, booking) => sum + (booking.seats?.length || 0), 0),
    totalSuccessfulPayments: successful.length,
    totalPendingPayments: pending.length,
    totalFailedPayments: failed.length,
  };
};

const revenueByDate = (db) => {
  const map = new Map();
  db.bookings.forEach((booking) => {
    const date = String(booking.createdAt || '').slice(0, 10) || booking.showDate;
    if (!map.has(date)) map.set(date, { date, totalRevenue: 0, totalBookings: 0, totalTickets: 0 });
    const item = map.get(date);
    item.totalBookings += 1;
    item.totalTickets += booking.seats?.length || 0;
    if (upper(booking.paymentStatus) === 'SUCCESS') item.totalRevenue += Number(booking.finalAmount ?? booking.totalAmount ?? 0);
  });
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
};

const topMovies = (db) => db.movies.map((movie) => {
  const bookings = db.bookings.filter((booking) => booking.movieId === movie.id && upper(booking.paymentStatus) === 'SUCCESS');
  return {
    id: movie.id,
    movieId: movie.id,
    title: movie.title,
    movieTitle: movie.title,
    poster: movie.posterUrl,
    posterUrl: movie.posterUrl,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + Number(booking.finalAmount ?? booking.totalAmount ?? 0), 0),
  };
}).sort((a, b) => b.totalRevenue - a.totalRevenue);

const topCinemas = (db) => db.cinemas.map((cinema) => {
  const bookings = db.bookings.filter((booking) => booking.cinemaId === cinema.id && upper(booking.paymentStatus) === 'SUCCESS');
  return {
    id: cinema.id,
    cinemaId: cinema.id,
    name: cinema.name,
    cinemaName: cinema.name,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + Number(booking.finalAmount ?? booking.totalAmount ?? 0), 0),
  };
}).sort((a, b) => b.totalRevenue - a.totalRevenue);

const enrichBooking = (db, booking) => {
  const user = db.users.find((item) => item.id === booking.userId);
  const showtime = db.showtimes.find((item) => item.id === booking.showtimeId);
  const movie = db.movies.find((item) => item.id === booking.movieId || item.id === showtime?.movieId);
  const cinema = db.cinemas.find((item) => item.id === booking.cinemaId || item.id === showtime?.cinemaId);
  return {
    ...booking,
    totalPrice: booking.totalAmount,
    userName: user?.fullName,
    user,
    movieTitle: booking.movieTitle || movie?.title,
    cinemaName: booking.cinemaName || cinema?.name,
    showtime,
    movie,
    cinema,
  };
};

const handleAuth = (db, method, path, body) => {
  if (path === '/auth/login' && method === 'post') {
    const email = lower(body.email);
    const expectedPasswords = {
      'admin@hotcinema.vn': 'admin123',
      'customer@hotcinema.vn': 'customer123',
      'staff@hotcinema.vn': 'staff123',
    };
    const user = db.users.find((item) => lower(item.email) === email) || db.users.find((item) => item.email === 'customer@hotcinema.vn');
    const knownAccount = Object.prototype.hasOwnProperty.call(expectedPasswords, email);
    if (knownAccount && body.password && body.password !== expectedPasswords[email]) {
      return { success: false, message: 'Mật khẩu mock không đúng.' };
    }
    return { accessToken: mockJwt(user), refreshToken: 'mock-refresh-token', userAuth: user };
  }
  if (path === '/auth/google' && method === 'post') {
    const user = db.users.find((item) => item.email === 'customer@hotcinema.vn');
    return { accessToken: mockJwt(user), refreshToken: 'mock-refresh-token', userAuth: user };
  }
  if (path.startsWith('/auth/google/callback')) {
    const user = db.users.find((item) => item.email === 'customer@hotcinema.vn');
    return { accessToken: mockJwt(user), refreshToken: 'mock-refresh-token', userAuth: user };
  }
  if (path === '/auth/current-user') return currentUser(db);
  if (['/auth/verify', '/auth/validate_token'].includes(path)) return { valid: true, user: currentUser(db) };
  if (path === '/auth/refresh') return { accessToken: mockJwt(currentUser(db)), refreshToken: 'mock-refresh-token' };
  if (path === '/auth/logout') return { success: true };
  if (path === '/auth/register' && method === 'post') return { success: true, message: 'Đăng ký mock thành công. Bạn có thể đăng nhập bằng tài khoản customer.' };
  if (path.includes('forget-password') || path.includes('resend-otp')) return { success: true, message: 'Mock OTP: 123456' };
  if (path.includes('verify-otp')) return { success: true, verified: true };
  if (path === '/auth/change-password') return { success: true };
  if (path === '/auth/verify-email') return { success: true, verified: true };
  return undefined;
};

const handleMovies = (db, method, path, params, body) => {
  if (!path.startsWith('/movies')) return undefined;
  if (method === 'get' && path === '/movies') return pageOf(db.movies, params);
  if (method === 'get' && path === '/movies/now-showing') return pageOf(db.movies.filter((item) => item.status === 'NOW_SHOWING'), params);
  if (method === 'get' && path === '/movies/coming-soon') return pageOf(db.movies.filter((item) => item.status === 'COMING_SOON'), params);
  if (method === 'get' && path === '/movies/top-rated') return pageOf([...db.movies].sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0)), params);
  if (method === 'get' && path === '/movies/search') {
    const keyword = lower(params.keyword || params.query || params.q);
    return pageOf(db.movies.filter((item) => lower(`${item.title} ${item.originalTitle} ${item.genres?.join(' ')}`).includes(keyword)), params);
  }
  if (method === 'get' && path.startsWith('/movies/genre/')) {
    const genre = decodeURIComponent(path.split('/').pop());
    return pageOf(db.movies.filter((item) => item.genres?.some((value) => lower(value) === lower(genre))), params);
  }
  const idMatch = path.match(/^\/movies\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const index = db.movies.findIndex((item) => item.id === id);
    if (method === 'get') return db.movies[index] || null;
    if (method === 'put' && index >= 0) {
      db.movies[index] = { ...db.movies[index], ...body, id };
      persistMockDatabase();
      return db.movies[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.movies.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  const statusMatch = path.match(/^\/movies\/(\d+)\/(activate|deactivate)$/);
  if (statusMatch && method === 'patch') {
    const movie = db.movies.find((item) => item.id === Number(statusMatch[1]));
    if (movie) {
      movie.isActive = statusMatch[2] === 'activate';
      movie.status = movie.isActive ? 'NOW_SHOWING' : 'INACTIVE';
      persistMockDatabase();
    }
    return movie || null;
  }
  if (method === 'post' && path === '/movies') {
    const movie = { id: nextId(db.movies), averageRating: 0, isActive: true, ...body };
    db.movies.unshift(movie);
    persistMockDatabase();
    return movie;
  }
  return undefined;
};

const handleCinemas = (db, method, path, params, body) => {
  if (!path.startsWith('/cinemas')) return undefined;
  if (method === 'get' && path === '/cinemas') return pageOf(db.cinemas, params);
  if (method === 'get' && path === '/cinemas/all-no-page') return db.cinemas;
  if (method === 'get' && path.startsWith('/cinemas/region-slug/')) {
    const slug = decodeURIComponent(path.split('/').pop());
    return pageOf(db.cinemas.filter((item) => item.regionSlug === slug), params);
  }
  if (method === 'get' && path === '/cinemas/search') {
    const keyword = lower(params.keyword);
    return pageOf(db.cinemas.filter((item) => lower(`${item.name} ${item.address} ${item.cityName}`).includes(keyword)), params);
  }
  const match = path.match(/^\/cinemas\/(\d+)$/);
  if (match) {
    const id = Number(match[1]);
    const index = db.cinemas.findIndex((item) => item.id === id);
    if (method === 'get') return db.cinemas[index] || null;
    if (['put', 'patch'].includes(method) && index >= 0) {
      db.cinemas[index] = { ...db.cinemas[index], ...body, id };
      persistMockDatabase();
      return db.cinemas[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.cinemas.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  if (method === 'post' && path === '/cinemas') {
    const cinema = { id: nextId(db.cinemas), status: 'ACTIVE', isActive: true, ...body };
    db.cinemas.unshift(cinema);
    persistMockDatabase();
    return cinema;
  }
  return undefined;
};

const handleRooms = (db, method, path, params, body) => {
  if (!path.startsWith('/rooms')) return undefined;
  if (method === 'get' && path === '/rooms') return pageOf(db.rooms, params);
  const cinemaMatch = path.match(/^\/rooms\/cinema\/(\d+)$/);
  if (cinemaMatch) {
    const cinemaId = Number(cinemaMatch[1]);
    if (method === 'get') return db.rooms.filter((item) => item.cinemaId === cinemaId);
    if (method === 'post') {
      const room = {
        id: nextId(db.rooms),
        cinemaId,
        isActive: true,
        status: 'ACTIVE',
        roomType: body.theaterType || body.roomType || 'STANDARD_2D',
        rowsCount: body.numberOfRows || body.rowsCount || 8,
        seatsPerRow: body.numberOfColumns || body.seatsPerRow || 10,
        ...body,
      };
      room.totalSeats = Number(room.numberOfRows || room.rowsCount) * Number(room.numberOfColumns || room.seatsPerRow);
      db.rooms.push(room);
      persistMockDatabase();
      return room;
    }
  }
  const match = path.match(/^\/rooms\/(\d+)$/);
  if (match) {
    const id = Number(match[1]);
    const index = db.rooms.findIndex((item) => item.id === id);
    if (method === 'get') return db.rooms[index] || null;
    if (method === 'put' && index >= 0) {
      db.rooms[index] = { ...db.rooms[index], ...body, id };
      persistMockDatabase();
      return db.rooms[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.rooms.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  return undefined;
};

const handleSeats = (db, method, path, params, body) => {
  if (!path.startsWith('/seats')) return undefined;
  const roomMatch = path.match(/^\/seats\/theater\/(\d+)(?:\/active)?$/);
  if (roomMatch && method === 'get') {
    const seats = db.seats.filter((item) => item.roomId === Number(roomMatch[1]));
    return path.endsWith('/active') ? seats.filter((item) => item.isActive) : seats;
  }
  const typeMatch = path.match(/^\/seats\/type\/([^/]+)$/);
  if (typeMatch && method === 'get') return db.seats.filter((item) => upper(item.seatType) === upper(typeMatch[1]));
  const cinemaMatch = path.match(/^\/seats\/cinema\/(\d+)$/);
  if (cinemaMatch && method === 'get') {
    const roomIds = new Set(db.rooms.filter((room) => room.cinemaId === Number(cinemaMatch[1])).map((room) => room.id));
    return db.seats.filter((item) => roomIds.has(item.roomId));
  }
  const match = path.match(/^\/seats\/(\d+)$/);
  if (match) {
    const id = Number(match[1]);
    const index = db.seats.findIndex((item) => item.id === id);
    if (method === 'get') return db.seats[index] || null;
    if (['put', 'patch'].includes(method) && index >= 0) {
      db.seats[index] = { ...db.seats[index], ...body, id };
      persistMockDatabase();
      return db.seats[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.seats.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  const toggleMatch = path.match(/^\/seats\/(\d+)\/(activate|deactivate)$/);
  if (toggleMatch && method === 'patch') {
    const seat = db.seats.find((item) => item.id === Number(toggleMatch[1]));
    if (seat) {
      seat.isActive = toggleMatch[2] === 'activate';
      seat.status = seat.isActive ? 'available' : 'maintenance';
      persistMockDatabase();
    }
    return seat || null;
  }
  if (method === 'post' && path === '/seats') {
    const seat = { id: nextId(db.seats), status: 'available', isActive: true, ...body };
    db.seats.push(seat);
    persistMockDatabase();
    return seat;
  }
  return undefined;
};

const handleShowtimes = (db, method, path, params, body) => {
  if (!path.startsWith('/showtime')) return undefined;
  if (method === 'get' && path === '/showtime') {
    let items = [...db.showtimes];
    if (params.date) items = items.filter((item) => item.showDate === params.date);
    if (params.movieId) items = items.filter((item) => item.movieId === Number(params.movieId));
    if (params.cinemaId) items = items.filter((item) => item.cinemaId === Number(params.cinemaId));
    return pageOf(items, params);
  }
  const movieDate = path.match(/^\/showtime\/movie\/(\d+)\/date\/([^/]+)$/);
  if (movieDate && method === 'get') return cinemaShowtimePage(db, movieDate[1], movieDate[2], params);
  const cinemaDate = path.match(/^\/showtime\/cinema\/(\d+)\/date\/([^/]+)$/);
  if (cinemaDate && method === 'get') {
    const cinemaId = Number(cinemaDate[1]);
    const date = cinemaDate[2];
    return db.showtimes.filter((item) => item.cinemaId === cinemaId && item.showDate === date);
  }
  if (method === 'post' && path === '/showtime/filters') {
    let items = [...db.showtimes];
    const filters = body || {};
    if (filters.movieId) items = items.filter((item) => item.movieId === Number(filters.movieId));
    if (filters.cinemaId) items = items.filter((item) => item.cinemaId === Number(filters.cinemaId));
    if (filters.date || filters.showDate) items = items.filter((item) => item.showDate === (filters.date || filters.showDate));
    return items;
  }
  const seatsMatch = path.match(/^\/showtime\/(\d+)\/seats$/);
  if (seatsMatch && method === 'get') return getShowtimeSeats(db, seatsMatch[1]);
  const lockMatch = path.match(/^\/showtime\/(\d+)\/(lock-seat|unlock-seat)\/(\d+)$/);
  if (lockMatch && method === 'post') {
    const [, showtimeId, action, seatId] = lockMatch;
    db.showtimeSeatState ||= {};
    const key = `${showtimeId}:${seatId}`;
    if (action === 'lock-seat') db.showtimeSeatState[key] = { status: 'held', lockedByUserId: params.userId || currentUser(db)?.id || null };
    else delete db.showtimeSeatState[key];
    persistMockDatabase();
    return { success: true, showtimeId: Number(showtimeId), seatId: Number(seatId) };
  }
  const statusMatch = path.match(/^\/showtime\/(\d+)\/status$/);
  if (statusMatch && method === 'patch') {
    const showtime = db.showtimes.find((item) => item.id === Number(statusMatch[1]));
    if (showtime) {
      showtime.status = body.status;
      persistMockDatabase();
    }
    return showtime || null;
  }
  const idMatch = path.match(/^\/showtime\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const index = db.showtimes.findIndex((item) => item.id === id);
    if (method === 'get') return db.showtimes[index] || null;
    if (method === 'put' && index >= 0) {
      const room = db.rooms.find((item) => item.id === Number(body.theaterId || body.roomId));
      const movie = db.movies.find((item) => item.id === Number(body.movieId));
      const cinema = db.cinemas.find((item) => item.id === Number(body.cinemaId || room?.cinemaId));
      db.showtimes[index] = { ...db.showtimes[index], ...body, id, roomId: room?.id || body.roomId, theaterId: room?.id || body.theaterId, roomName: room?.name, movieTitle: movie?.title, cinemaId: cinema?.id, cinemaName: cinema?.name };
      persistMockDatabase();
      return db.showtimes[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.showtimes.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  if (method === 'post' && path === '/showtime') {
    const room = db.rooms.find((item) => item.id === Number(body.theaterId || body.roomId));
    const movie = db.movies.find((item) => item.id === Number(body.movieId));
    const cinema = db.cinemas.find((item) => item.id === Number(body.cinemaId || room?.cinemaId));
    const showtime = {
      id: nextId(db.showtimes, 100),
      ...body,
      roomId: room?.id || body.roomId || body.theaterId,
      theaterId: room?.id || body.theaterId,
      roomName: room?.name,
      movieTitle: movie?.title,
      moviePoster: movie?.posterUrl,
      cinemaId: cinema?.id,
      cinemaName: cinema?.name,
      showDate: body.showDate || body.date,
      date: body.showDate || body.date,
      price: body.basePrice,
      status: body.status || 'AVAILABLE',
    };
    db.showtimes.push(showtime);
    persistMockDatabase();
    return showtime;
  }
  return undefined;
};

const handleBookings = (db, method, path, params, body) => {
  if (!path.startsWith('/bookings')) return undefined;
  if (method === 'get' && path === '/bookings') return pageOf(db.bookings.map((item) => enrichBooking(db, item)), params);
  if (method === 'get' && path === '/bookings/statistics') return revenueSummary(db);
  if (method === 'get' && path === '/bookings/count-by-status') {
    return db.bookings.reduce((acc, item) => ({ ...acc, [upper(item.status)]: (acc[upper(item.status)] || 0) + 1 }), {});
  }
  if (method === 'get' && path === '/bookings/my-bookings') {
    const user = currentUser(db);
    return pageOf(db.bookings.filter((item) => item.userId === user.id).map((item) => enrichBooking(db, item)), params);
  }
  if (method === 'get' && path === '/bookings/my-bookings/history') {
    const user = currentUser(db);
    return db.bookings.filter((item) => item.userId === user.id).map((item) => enrichBooking(db, item));
  }
  const userHistory = path.match(/^\/bookings\/(?:history\/user|user)\/(\d+)$/);
  if (userHistory && method === 'get') return pageOf(db.bookings.filter((item) => item.userId === Number(userHistory[1])).map((item) => enrichBooking(db, item)), params);
  const codeMatch = path.match(/^\/bookings\/code\/([^/]+)$/);
  if (codeMatch && method === 'get') return enrichBooking(db, db.bookings.find((item) => item.bookingCode === codeMatch[1]) || {});
  const statusMatch = path.match(/^\/bookings\/(\d+)\/status$/);
  if (statusMatch && method === 'patch') {
    const booking = db.bookings.find((item) => item.id === Number(statusMatch[1]));
    if (booking) {
      booking.status = upper(body.status);
      booking.bookingStatus = upper(body.status);
      if (booking.status === 'CANCELLED') booking.paymentStatus = booking.paymentStatus === 'SUCCESS' ? 'REFUNDED' : 'CANCELLED';
      persistMockDatabase();
    }
    return booking ? enrichBooking(db, booking) : null;
  }
  const idMatch = path.match(/^\/bookings\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const index = db.bookings.findIndex((item) => item.id === id);
    if (method === 'get') return index >= 0 ? enrichBooking(db, db.bookings[index]) : null;
    if (method === 'put' && index >= 0) {
      db.bookings[index] = { ...db.bookings[index], ...body, id };
      persistMockDatabase();
      return enrichBooking(db, db.bookings[index]);
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.bookings.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  if (method === 'post' && path === '/bookings') {
    const showtime = db.showtimes.find((item) => item.id === Number(body.showtimeId));
    const user = currentUser(db);
    const seats = getShowtimeSeats(db, showtime?.id).filter((seat) => (body.seatIds || []).map(Number).includes(Number(seat.id)));
    const subtotal = seats.reduce((sum, seat) => sum + Number(seat.price || 0), 0);
    const promotion = db.promotions.find((item) => upper(item.code) === upper(body.promotionCode) && item.isActive);
    const discount = promotion
      ? promotion.discountType === 'PERCENTAGE'
        ? Math.min(subtotal * Number(promotion.discountValue || 0) / 100, Number(promotion.maxDiscount || subtotal))
        : Math.min(subtotal, Number(promotion.discountValue || 0))
      : 0;
    const booking = {
      id: nextId(db.bookings, 1000),
      userId: user.id,
      bookingCode: `HC${Date.now().toString().slice(-8)}`,
      showtimeId: showtime?.id,
      movieId: showtime?.movieId,
      movieTitle: showtime?.movieTitle,
      cinemaId: showtime?.cinemaId,
      cinemaName: showtime?.cinemaName,
      cinemaAddress: showtime?.cinemaAddress,
      roomId: showtime?.roomId,
      roomName: showtime?.roomName,
      showDate: showtime?.showDate,
      startTime: showtime?.startTime,
      endTime: showtime?.endTime,
      seats: seats.map((seat) => ({ id: seat.id, name: seat.name, seatName: seat.name, seatType: seat.seatType, price: seat.price })),
      seatIds: seats.map((seat) => seat.id),
      status: 'PENDING',
      bookingStatus: 'PENDING',
      paymentStatus: 'PENDING',
      subtotal,
      discountAmount: discount,
      totalAmount: Math.max(0, subtotal - discount),
      finalAmount: Math.max(0, subtotal - discount),
      promotionCode: promotion?.code || null,
      createdAt: new Date().toISOString(),
    };
    booking.bookingId = booking.id;
    db.bookings.unshift(booking);
    persistMockDatabase();
    return booking;
  }
  return undefined;
};

const handlePayments = (db, method, path, params, body) => {
  if (!path.startsWith('/payments')) return undefined;
  if (method === 'get' && path === '/payments') return pageOf(db.payments, params);
  if (method === 'get' && path === '/payments/all-no-page') return db.payments;
  const bookingMatch = path.match(/^\/payments\/booking\/(\d+)$/);
  if (bookingMatch && method === 'get') return db.payments.filter((item) => item.bookingId === Number(bookingMatch[1]));
  const transactionMatch = path.match(/^\/payments\/transaction\/([^/]+)$/);
  if (transactionMatch && method === 'get') return db.payments.find((item) => item.transactionId === transactionMatch[1]) || null;
  const statusList = path.match(/^\/payments\/status\/([^/]+)$/);
  if (statusList && method === 'get') return pageOf(db.payments.filter((item) => upper(item.status) === upper(statusList[1])), params);
  const idMatch = path.match(/^\/payments\/(\d+)$/);
  if (idMatch) {
    const payment = db.payments.find((item) => item.id === Number(idMatch[1]));
    if (method === 'get') return payment || null;
  }
  const statusMatch = path.match(/^\/payments\/(\d+)\/status$/);
  if (statusMatch && method === 'patch') {
    const payment = db.payments.find((item) => item.id === Number(statusMatch[1]));
    if (payment) {
      payment.status = upper(body.status);
      persistMockDatabase();
    }
    return payment || null;
  }
  if (method === 'post' && path === '/payments') {
    const booking = db.bookings.find((item) => item.id === Number(body.bookingId));
    const payment = {
      id: nextId(db.payments, 500),
      paymentId: nextId(db.payments, 500),
      bookingId: booking?.id,
      bookingCode: booking?.bookingCode,
      transactionId: `MOCK-${upper(body.paymentMethod)}-${Date.now().toString().slice(-6)}`,
      amount: Number(booking?.finalAmount ?? booking?.totalAmount ?? 0),
      paymentMethod: upper(body.paymentMethod || 'MOMO'),
      method: upper(body.paymentMethod || 'MOMO'),
      status: 'SUCCESS',
      paymentStatus: 'SUCCESS',
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    payment.paymentId = payment.id;
    db.payments.unshift(payment);
    if (booking) {
      booking.paymentStatus = 'SUCCESS';
      booking.status = 'CONFIRMED';
      booking.bookingStatus = 'CONFIRMED';
      booking.paidAt = payment.paymentDate;
      (booking.seatIds || booking.seats?.map((seat) => seat.id) || []).forEach((seatId) => {
        db.showtimeSeatState ||= {};
        db.showtimeSeatState[`${booking.showtimeId}:${seatId}`] = { status: 'booked', lockedByUserId: booking.userId };
      });
    }
    persistMockDatabase();
    return payment;
  }
  if (method === 'post' && path === '/payments/momo-callback') return { success: true, paymentStatus: 'SUCCESS', ...body };
  return undefined;
};

const handleUsers = (db, method, path, params, body) => {
  if (!path.startsWith('/users')) return undefined;
  if (method === 'put' && path === '/users/profile') {
    const user = currentUser(db);
    const index = db.users.findIndex((item) => item.id === user.id);
    db.users[index] = { ...db.users[index], ...body };
    persistMockDatabase();
    return db.users[index];
  }
  if (method === 'get' && path === '/users') return pageOf(db.users, params);
  if (method === 'get' && path === '/users/staffs') return pageOf(db.users.filter((item) => upper(item.role) === 'STAFF'), params);
  if (method === 'get' && path === '/users/customers') return pageOf(db.users.filter((item) => upper(item.role) === 'CUSTOMER'), params);
  if (method === 'get' && path === '/users/search') {
    const keyword = lower(params.keyword);
    return pageOf(db.users.filter((item) => lower(`${item.fullName} ${item.email} ${item.username}`).includes(keyword)), params);
  }
  const roleMatch = path.match(/^\/users\/role\/([^/]+)$/);
  if (roleMatch && method === 'get') return pageOf(db.users.filter((item) => upper(item.role) === upper(roleMatch[1])), params);
  const emailMatch = path.match(/^\/users\/email\/(.+)$/);
  if (emailMatch && method === 'get') return db.users.find((item) => lower(item.email) === lower(decodeURIComponent(emailMatch[1]))) || null;
  const usernameMatch = path.match(/^\/users\/username\/(.+)$/);
  if (usernameMatch && method === 'get') return db.users.find((item) => lower(item.username) === lower(decodeURIComponent(usernameMatch[1]))) || null;
  const avatarMatch = path.match(/^\/users\/(\d+)\/avatar$/);
  if (avatarMatch && method === 'put') {
    const user = db.users.find((item) => item.id === Number(avatarMatch[1]));
    if (user) {
      user.avatarUrl = params.avatarUrl || body.avatarUrl || '';
      persistMockDatabase();
    }
    return user || null;
  }
  const passwordMatch = path.match(/^\/users\/(\d+)\/password$/);
  if (passwordMatch && method === 'put') return { success: true };
  const toggleMatch = path.match(/^\/users\/(\d+)\/(activate|deactivate)$/);
  if (toggleMatch && method === 'put') {
    const user = db.users.find((item) => item.id === Number(toggleMatch[1]));
    if (user) {
      user.isActive = toggleMatch[2] === 'activate';
      user.status = user.isActive ? 'ACTIVE' : 'INACTIVE';
      persistMockDatabase();
    }
    return user || null;
  }
  const roleChange = path.match(/^\/users\/(\d+)\/change-roles$/);
  if (roleChange && method === 'post') {
    const user = db.users.find((item) => item.id === Number(roleChange[1]));
    if (user) {
      user.role = upper(params.role || body.role);
      user.roles = [{ name: user.role }];
      persistMockDatabase();
    }
    return user || null;
  }
  const idMatch = path.match(/^\/users\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const index = db.users.findIndex((item) => item.id === id);
    if (method === 'get') return db.users[index] || null;
    if (method === 'put' && index >= 0) {
      db.users[index] = { ...db.users[index], ...body, id };
      persistMockDatabase();
      return db.users[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.users.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  if (method === 'post' && path === '/users') {
    const role = upper(body.role || body.roles?.[0] || 'CUSTOMER');
    const user = { id: nextId(db.users), status: 'ACTIVE', isActive: true, role, roles: [{ name: role }], ...body };
    db.users.push(user);
    persistMockDatabase();
    return user;
  }
  return undefined;
};

const handlePromotions = (db, method, path, params, body) => {
  if (!path.startsWith('/promotions')) return undefined;
  if (method === 'get' && path === '/promotions') return pageOf(db.promotions, params);
  if (method === 'get' && path === '/promotions/active') return pageOf(db.promotions.filter((item) => item.isActive), params);
  const codeMatch = path.match(/^\/promotions\/code\/(.+)$/);
  if (codeMatch && method === 'get') return db.promotions.find((item) => upper(item.code) === upper(decodeURIComponent(codeMatch[1]))) || null;
  const toggleMatch = path.match(/^\/promotions\/(\d+)\/(activate|deactivate)$/);
  if (toggleMatch && method === 'post') {
    const promotion = db.promotions.find((item) => item.id === Number(toggleMatch[1]));
    if (promotion) {
      promotion.isActive = toggleMatch[2] === 'activate';
      promotion.status = promotion.isActive ? 'ACTIVE' : 'INACTIVE';
      persistMockDatabase();
    }
    return promotion || null;
  }
  const idMatch = path.match(/^\/promotions\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const index = db.promotions.findIndex((item) => item.id === id);
    if (method === 'get') return db.promotions[index] || null;
    if (method === 'put' && index >= 0) {
      db.promotions[index] = { ...db.promotions[index], ...body, id };
      persistMockDatabase();
      return db.promotions[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.promotions.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  if (method === 'post' && path === '/promotions') {
    const promotion = { id: nextId(db.promotions), usedCount: 0, status: 'ACTIVE', isActive: true, ...body };
    db.promotions.unshift(promotion);
    persistMockDatabase();
    return promotion;
  }
  return undefined;
};

const handleConcessions = (db, method, path, params, body) => {
  if (!path.startsWith('/concessions')) return undefined;
  if (method === 'get' && path === '/concessions') return db.concessions;
  const match = path.match(/^\/concessions\/(\d+)$/);
  if (match) {
    const id = Number(match[1]);
    const index = db.concessions.findIndex((item) => item.id === id);
    if (method === 'put' && index >= 0) {
      db.concessions[index] = { ...db.concessions[index], ...body, id };
      persistMockDatabase();
      return db.concessions[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.concessions.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  if (method === 'post' && path === '/concessions') {
    const product = { id: nextId(db.concessions), ...body };
    db.concessions.unshift(product);
    persistMockDatabase();
    return product;
  }
  return undefined;
};

const handleReviews = (db, method, path, params, body) => {
  if (!path.startsWith('/reviews')) return undefined;
  if (method === 'get' && path === '/reviews') return pageOf(db.reviews, params);
  const movieMatch = path.match(/^\/reviews\/movie\/(\d+)$/);
  if (movieMatch && method === 'get') return pageOf(db.reviews.filter((item) => item.movieId === Number(movieMatch[1]) && item.status !== 'REJECTED'), params);
  const avgMatch = path.match(/^\/reviews\/average-rating\/(\d+)$/);
  if (avgMatch && method === 'get') {
    const reviews = db.reviews.filter((item) => item.movieId === Number(avgMatch[1]) && item.status === 'APPROVED');
    return reviews.length ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length : 0;
  }
  const moderationMatch = path.match(/^\/reviews\/(\d+)\/(approve|reject)$/);
  if (moderationMatch && method === 'put') {
    const review = db.reviews.find((item) => item.id === Number(moderationMatch[1]));
    if (review) {
      review.status = moderationMatch[2] === 'approve' ? 'APPROVED' : 'REJECTED';
      persistMockDatabase();
    }
    return review || null;
  }
  const idMatch = path.match(/^\/reviews\/(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const index = db.reviews.findIndex((item) => item.id === id);
    if (method === 'get') return db.reviews[index] || null;
    if (method === 'put' && index >= 0) {
      db.reviews[index] = { ...db.reviews[index], ...body, id };
      persistMockDatabase();
      return db.reviews[index];
    }
    if (method === 'delete' && index >= 0) {
      const [removed] = db.reviews.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  if (method === 'post' && path === '/reviews') {
    const user = currentUser(db);
    const review = { id: nextId(db.reviews), userId: user.id, userName: user.fullName, status: 'PENDING', createdAt: new Date().toISOString(), ...body };
    review.comment ||= review.content;
    review.content ||= review.comment;
    db.reviews.unshift(review);
    persistMockDatabase();
    return review;
  }
  return undefined;
};

const handleNotifications = (db, method, path, params, body) => {
  if (!path.startsWith('/notifications')) return undefined;
  const user = currentUser(db);
  if (method === 'get' && path === '/notifications') return db.notifications.filter((item) => item.userId === user.id || upper(user.role) === 'ADMIN');
  if (method === 'post' && path === '/notifications/broadcast') {
    const baseId = nextId(db.notifications);
    db.users.forEach((target, index) => {
      db.notifications.unshift({ id: baseId + index, userId: target.id, title: body.title || 'Thông báo hệ thống', content: body.content || body.message || '', message: body.content || body.message || '', type: body.type || 'SYSTEM', read: false, isRead: false, createdAt: new Date().toISOString() });
    });
    persistMockDatabase();
    return { success: true };
  }
  if (['patch', 'put'].includes(method) && ['/notifications/read-all', '/notifications/mark-all-read'].includes(path)) {
    db.notifications.filter((item) => item.userId === user.id || upper(user.role) === 'ADMIN').forEach((item) => { item.read = true; item.isRead = true; });
    persistMockDatabase();
    return { success: true };
  }
  const readMatch = path.match(/^\/notifications\/(\d+)\/(?:read|mark-read)$/);
  if (readMatch && ['patch', 'put'].includes(method)) {
    const notification = db.notifications.find((item) => item.id === Number(readMatch[1]));
    if (notification) { notification.read = true; notification.isRead = true; persistMockDatabase(); }
    return notification || null;
  }
  const idMatch = path.match(/^\/notifications\/(\d+)$/);
  if (idMatch && method === 'delete') {
    const index = db.notifications.findIndex((item) => item.id === Number(idMatch[1]));
    if (index >= 0) {
      const [removed] = db.notifications.splice(index, 1);
      persistMockDatabase();
      return removed;
    }
  }
  return undefined;
};

const handleRolesPermissions = (db, method, path, params, body, config) => {
  if (path === '/roles/all' && method === 'get') return db.roles;
  if (path === '/roles' && method === 'get') return pageOf(db.roles, params);
  if (path === '/roles' && method === 'post') {
    const role = { id: nextId(db.roles), active: true, permissions: [], userCount: 0, ...body };
    db.roles.push(role);
    persistMockDatabase();
    return role;
  }
  const permissionMutation = path.match(/^\/roles\/(\d+)\/permissions$/);
  if (permissionMutation) {
    const role = db.roles.find((item) => item.id === Number(permissionMutation[1]));
    const ids = Array.isArray(body) ? body.map(Number) : [];
    if (role && method === 'post') {
      const map = new Map(role.permissions.map((item) => [item.id, item]));
      ids.forEach((id) => { const permission = db.permissions.find((item) => item.id === id); if (permission) map.set(id, permission); });
      role.permissions = [...map.values()];
      persistMockDatabase();
      return role;
    }
    if (role && method === 'delete') {
      const deleteBody = parseBody(config);
      const removeIds = Array.isArray(deleteBody) ? deleteBody.map(Number) : ids;
      role.permissions = role.permissions.filter((item) => !removeIds.includes(Number(item.id)));
      persistMockDatabase();
      return role;
    }
  }
  const roleToggle = path.match(/^\/roles\/(\d+)\/(activate|deactivate)$/);
  if (roleToggle && method === 'patch') {
    const role = db.roles.find((item) => item.id === Number(roleToggle[1]));
    if (role) { role.active = roleToggle[2] === 'activate'; persistMockDatabase(); }
    return role || null;
  }
  const roleMatch = path.match(/^\/roles\/(\d+)$/);
  if (roleMatch) {
    const id = Number(roleMatch[1]);
    const index = db.roles.findIndex((item) => item.id === id);
    if (method === 'get') return db.roles[index] || null;
    if (['put', 'patch'].includes(method) && index >= 0) { db.roles[index] = { ...db.roles[index], ...body, id }; persistMockDatabase(); return db.roles[index]; }
    if (method === 'delete' && index >= 0) { const [removed] = db.roles.splice(index, 1); persistMockDatabase(); return removed; }
  }
  const roleCode = path.match(/^\/roles\/code\/([^/]+)$/);
  if (roleCode && method === 'get') return db.roles.find((item) => upper(item.name) === upper(roleCode[1])) || null;

  if (path === '/permissions/all' && method === 'get') return db.permissions;
  if (path === '/permissions' && method === 'get') return pageOf(db.permissions, params);
  if (path === '/permissions' && method === 'post') {
    const permission = { id: nextId(db.permissions), ...body };
    db.permissions.push(permission);
    persistMockDatabase();
    return permission;
  }
  const permissionMatch = path.match(/^\/permissions\/(\d+)$/);
  if (permissionMatch) {
    const id = Number(permissionMatch[1]);
    const index = db.permissions.findIndex((item) => item.id === id);
    if (method === 'get') return db.permissions[index] || null;
    if (['put', 'patch'].includes(method) && index >= 0) { db.permissions[index] = { ...db.permissions[index], ...body, id }; persistMockDatabase(); return db.permissions[index]; }
    if (method === 'delete' && index >= 0) { const [removed] = db.permissions.splice(index, 1); persistMockDatabase(); return removed; }
  }
  return undefined;
};

const handleMisc = (db, method, path, params, body) => {
  if (method === 'get' && path === '/regions') return db.regions;
  if (method === 'get' && path === '/cities') return db.cities;
  const regionMatch = path.match(/^\/regions\/(\d+)$/);
  if (regionMatch && method === 'get') return db.regions.find((item) => item.id === Number(regionMatch[1])) || null;
  if (method === 'get' && path === '/regions/search') return db.regions.filter((item) => lower(item.name).includes(lower(params.name)));
  if (path === '/settings' && method === 'get') return db.settings;
  if (path === '/settings' && method === 'put') { db.settings = { ...db.settings, ...body }; persistMockDatabase(); return db.settings; }
  if (path === '/revenue/summary' && method === 'get') return revenueSummary(db);
  if (path === '/revenue/by-date' && method === 'get') return revenueByDate(db);
  if (path === '/revenue/top-movies' && method === 'get') return topMovies(db).slice(0, Number(params.limit || 5));
  if (path === '/revenue/top-cinemas' && method === 'get') return topCinemas(db).slice(0, Number(params.limit || 5));
  if (path === '/revenue/by-payment-method' && method === 'get') {
    return ['MOMO', 'VNPAY', 'CASH'].map((paymentMethod) => ({ paymentMethod, totalRevenue: db.payments.filter((item) => item.status === 'SUCCESS' && item.paymentMethod === paymentMethod).reduce((sum, item) => sum + Number(item.amount || 0), 0) }));
  }
  const ticketMatch = path.match(/^\/tickets\/download-booking\/(\d+)$/);
  if (ticketMatch && method === 'get') {
    const booking = db.bookings.find((item) => item.id === Number(ticketMatch[1]));
    const text = `HOTCINEMA MOCK TICKET\nBooking: ${booking?.bookingCode || ticketMatch[1]}\nMovie: ${booking?.movieTitle || ''}\nSeats: ${(booking?.seats || []).map((seat) => seat.name).join(', ')}\nAmount: ${booking?.totalAmount || 0} VND`;
    return new Blob([text], { type: 'application/pdf' });
  }
  return undefined;
};

const handlers = [
  handleAuth,
  handleMovies,
  handleCinemas,
  handleRooms,
  handleSeats,
  handleShowtimes,
  handleBookings,
  handlePayments,
  handleUsers,
  handlePromotions,
  handleConcessions,
  handleReviews,
  handleNotifications,
  handleRolesPermissions,
  handleMisc,
];

export const mockApiAdapter = async (config) => {
  if (MOCK_API_DELAY > 0) await wait(MOCK_API_DELAY);

  const db = getMockDatabase();
  const method = lower(config.method || 'get');
  const path = normalizePath(config);
  const params = getParams(config);
  const body = parseBody(config);

  let data;
  for (const handler of handlers) {
    data = handler(db, method, path, params, body, config);
    if (data !== undefined) break;
  }

  if (data === undefined) {
    console.warn(`[Mock API] Unhandled ${method.toUpperCase()} ${path}. Returning an empty mock response.`);
    data = method === 'get' ? [] : { success: true };
  }

  return {
    data,
    status: 200,
    statusText: 'OK (Mock)',
    headers: { 'x-hotcinema-mock': 'true' },
    config,
    request: { mock: true },
  };
};

export default mockApiAdapter;
