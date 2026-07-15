import {
  mockBookings,
  mockCinemas,
  mockGenres,
  mockMoviePeople,
  mockMovies,
  mockNotifications,
  mockPayments,
  mockPeople,
  mockPermissions,
  mockPromotions,
  mockRegions,
  mockRoles,
  mockRooms,
  mockShowtimes,
  mockUsers,
} from '@/mocks/mockData';

const clone = (value) => JSON.parse(JSON.stringify(value));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseBody = (data) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizePath = (config) => {
  const rawUrl = config.url || '/';
  const baseURL = config.baseURL || window.location.origin;
  const parsed = new URL(rawUrl, baseURL);
  return parsed.pathname.replace(/^\/api\/v\d+/, '') || '/';
};

const getParams = (config) => {
  const rawUrl = config.url || '/';
  const baseURL = config.baseURL || window.location.origin;
  const parsed = new URL(rawUrl, baseURL);
  const queryParams = Object.fromEntries(parsed.searchParams.entries());
  return { ...queryParams, ...(config.params || {}) };
};

const pageResult = (items, params = {}) => {
  const page = Math.max(toNumber(params.page, 0), 0);
  const size = Math.max(toNumber(params.size, items.length || 10), 1);
  const start = page * size;
  const data = items.slice(start, start + size);

  return {
    data,
    content: data,
    page,
    number: page,
    size,
    totalElements: items.length,
    totalPages: Math.max(Math.ceil(items.length / size), 1),
    first: page === 0,
    last: start + size >= items.length,
  };
};

const sortItems = (items, sort) => {
  if (!sort) return items;
  const [field, direction = 'asc'] = String(sort).split(',');
  const multiplier = direction.toLowerCase() === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    if (left === right) return 0;
    return left > right ? multiplier : -multiplier;
  });
};

const filterMovies = (params = {}) => {
  let items = [...mockMovies];

  if (params.keyword) {
    const keyword = String(params.keyword).toLowerCase();
    items = items.filter((movie) => (
      movie.title.toLowerCase().includes(keyword) ||
      movie.originalTitle.toLowerCase().includes(keyword) ||
      movie.description.toLowerCase().includes(keyword)
    ));
  }

  if (params.genre && params.genre !== 'all') {
    const genre = String(params.genre).toLowerCase();
    items = items.filter((movie) => movie.genres?.some((item) => (
      String(item.name || item).toLowerCase() === genre ||
      String(item.slug || '').toLowerCase() === genre
    )));
  }

  if (params.status && params.status !== 'all') {
    items = items.filter((movie) => String(movie.status).toUpperCase() === String(params.status).toUpperCase());
  }

  if (params.releaseYear && params.releaseYear !== 'all') {
    items = items.filter((movie) => String(new Date(movie.releaseDate).getFullYear()) === String(params.releaseYear));
  }

  return sortItems(items, params.sort || 'id,desc');
};

const seatsForShowtime = (showtimeId) => {
  const showtime = mockShowtimes.find((item) => Number(item.id) === Number(showtimeId)) || mockShowtimes[0];
  const room = mockRooms.find((item) => Number(item.id) === Number(showtime.roomId)) || mockRooms[0];
  const bookedSeatNames = new Set(
    mockBookings
      .filter((booking) => Number(booking.showtimeId) === Number(showtime.id))
      .flatMap((booking) => booking.seatNames || booking.seats || [])
  );

  const seats = [];
  const rows = Array.from({ length: room.rowsCount }, (_, index) => String.fromCharCode(65 + index));
  rows.forEach((rowLabel, rowIndex) => {
    for (let seatNumber = 1; seatNumber <= room.seatsPerRow; seatNumber += 1) {
      const name = `${rowLabel}${seatNumber}`;
      const id = Number(`${showtime.id}${rowIndex + 1}${String(seatNumber).padStart(2, '0')}`);
      seats.push({
        id,
        showtimeId: showtime.id,
        roomId: room.id,
        rowLabel,
        seatNumber,
        seatName: name,
        name,
        type: rowIndex >= room.rowsCount - 2 ? 'VIP' : 'STANDARD',
        seatType: rowIndex >= room.rowsCount - 2 ? 'VIP' : 'STANDARD',
        price: rowIndex >= room.rowsCount - 2 ? showtime.price + 30000 : showtime.price,
        status: bookedSeatNames.has(name) ? 'BOOKED' : 'AVAILABLE',
        isAvailable: !bookedSeatNames.has(name),
        isActive: true,
      });
    }
  });

  return seats;
};

const showtimesByMovie = (movieId, day, params = {}) => {
  const regionId = params.regionId ? Number(params.regionId) : null;
  const items = mockShowtimes.filter((showtime) => (
    Number(showtime.movieId) === Number(movieId) &&
    (!day || showtime.date === day)
  ));

  const cinemas = mockCinemas.filter((cinema) => !regionId || Number(cinema.regionId) === regionId);

  return cinemas
    .map((cinema) => {
      const cinemaShowtimes = items.filter((showtime) => Number(showtime.cinemaId) === Number(cinema.id));
      const formats = Object.values(cinemaShowtimes.reduce((acc, showtime) => {
        const key = showtime.format || '2D';
        if (!acc[key]) acc[key] = { format: key, versionName: key, showtimes: [] };
        acc[key].showtimes.push({
          ...showtime,
          startTime: showtime.startTime,
          time: showtime.startTime,
          roomName: mockRooms.find((room) => room.id === showtime.roomId)?.name,
        });
        return acc;
      }, {}));

      return {
        cinemaId: cinema.id,
        cinemaName: cinema.name,
        address: cinema.address,
        regionId: cinema.regionId,
        formats,
      };
    })
    .filter((cinema) => cinema.formats.length > 0);
};

const showtimesByCinema = (cinemaId, day) => {
  const grouped = mockShowtimes
    .filter((showtime) => Number(showtime.cinemaId) === Number(cinemaId) && (!day || showtime.date === day))
    .reduce((acc, showtime) => {
      const movie = mockMovies.find((item) => Number(item.id) === Number(showtime.movieId));
      if (!movie) return acc;
      if (!acc[movie.id]) {
        acc[movie.id] = {
          movieId: movie.id,
          movieTitle: movie.title,
          posterUrl: movie.posterUrl,
          formats: [],
        };
      }
      let format = acc[movie.id].formats.find((item) => item.format === showtime.format);
      if (!format) {
        format = { format: showtime.format, versionName: showtime.format, showtimes: [] };
        acc[movie.id].formats.push(format);
      }
      format.showtimes.push({ ...showtime, time: showtime.startTime });
      return acc;
    }, {});

  return Object.values(grouped);
};

const routeList = (path) => {
  if (path === '/movies') return mockMovies;
  if (path === '/genres' || path === '/genres/all') return mockGenres;
  if (path === '/regions') return mockRegions;
  if (path === '/cinemas' || path === '/cinemas/all') return mockCinemas;
  if (path === '/rooms') return mockRooms;
  if (path === '/showtime') return mockShowtimes;
  if (path === '/bookings') return mockBookings;
  if (path === '/users') return mockUsers;
  if (path === '/roles' || path === '/roles/all') return mockRoles;
  if (path === '/permissions' || path === '/permissions/all') return mockPermissions;
  if (path === '/promotions' || path === '/promotions/active') return mockPromotions;
  if (path === '/notifications') return mockNotifications;
  if (path === '/people' || path === '/people/all') return mockPeople;
  if (path === '/payments') return mockPayments;
  return null;
};

const createAuthResponse = (user = mockUsers[1]) => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  token: 'mock-access-token',
  user,
  userAuth: user,
});

const findById = (items, id) => items.find((item) => Number(item.id) === Number(id));

const createItem = (items, body) => {
  const nextId = Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
  const item = { id: nextId, ...body, createdAt: body.createdAt || new Date().toISOString() };
  items.push(item);
  return item;
};

const updateItem = (items, id, body) => {
  const index = items.findIndex((item) => Number(item.id) === Number(id));
  if (index < 0) return null;
  items[index] = { ...items[index], ...body, id: items[index].id };
  return items[index];
};

const handleGet = (path, params) => {
  if (path === '/auth/user-info') return mockUsers[1];
  if (path === '/auth/logout') return { success: true };
  if (path === '/auth/refresh-token') return createAuthResponse();

  if (path === '/movies/search') return pageResult(filterMovies(params), params);
  if (path === '/movies/coming-soon') return pageResult(filterMovies({ ...params, status: 'COMING_SOON' }), params);
  if (path === '/movies/now-showing') return pageResult(filterMovies({ ...params, status: 'NOW_SHOWING' }), params);
  if (path === '/movies/top-rated') return pageResult(sortItems([...mockMovies], 'averageRating,desc'), params);

  const movieGenreMatch = path.match(/^\/movies\/genre\/(.+)$/);
  if (movieGenreMatch) {
    return pageResult(filterMovies({ ...params, genre: decodeURIComponent(movieGenreMatch[1]) }), params);
  }

  const movieSlugMatch = path.match(/^\/movies\/slug\/(.+)$/);
  if (movieSlugMatch) {
    return mockMovies.find((movie) => movie.slug === decodeURIComponent(movieSlugMatch[1]));
  }

  const moviePeopleMatch = path.match(/^\/movies\/(\d+)\/people$/);
  if (moviePeopleMatch) {
    return mockMoviePeople.filter((item) => Number(item.movieId) === Number(moviePeopleMatch[1]));
  }

  const movieVersionMatch = path.match(/^\/movies\/(\d+)\/version$/);
  if (movieVersionMatch) {
    return [
      { id: 1, movieId: Number(movieVersionMatch[1]), name: '2D', format: '2D' },
      { id: 2, movieId: Number(movieVersionMatch[1]), name: 'IMAX', format: 'IMAX' },
    ];
  }

  const movieShowtimeMatch = path.match(/^\/movies\/(\d+)\/showtime\/([^/]+)$/);
  if (movieShowtimeMatch) {
    return showtimesByMovie(movieShowtimeMatch[1], movieShowtimeMatch[2], params);
  }

  const cinemaRegionMatch = path.match(/^\/cinemas\/region\/(.+)$/);
  if (cinemaRegionMatch) {
    const id = decodeURIComponent(cinemaRegionMatch[1]);
    return mockCinemas.filter((cinema) => String(cinema.regionId) === String(id) || cinema.regionName === id);
  }

  const cinemaRoomsMatch = path.match(/^\/cinemas\/(\d+)\/rooms$/);
  if (cinemaRoomsMatch) {
    return mockRooms.filter((room) => Number(room.cinemaId) === Number(cinemaRoomsMatch[1]));
  }

  const cinemaShowtimeMatch = path.match(/^\/cinemas\/(\d+)\/showtime\/([^/]+)$/);
  if (cinemaShowtimeMatch) {
    return showtimesByCinema(cinemaShowtimeMatch[1], cinemaShowtimeMatch[2]);
  }

  const roomCinemaMatch = path.match(/^\/rooms\/cinema\/(\d+)$/);
  if (roomCinemaMatch) {
    return mockRooms.filter((room) => Number(room.cinemaId) === Number(roomCinemaMatch[1]));
  }

  const showtimeSeatsMatch = path.match(/^\/showtime\/(\d+)\/seats$/);
  if (showtimeSeatsMatch) return seatsForShowtime(showtimeSeatsMatch[1]);

  const showtimeMovieDateMatch = path.match(/^\/showtime\/movie\/(\d+)\/date\/([^/]+)$/);
  if (showtimeMovieDateMatch) return showtimesByMovie(showtimeMovieDateMatch[1], showtimeMovieDateMatch[2], params);

  const showtimeCinemaDateMatch = path.match(/^\/showtime\/cinema\/(\d+)\/date\/([^/]+)$/);
  if (showtimeCinemaDateMatch) return showtimesByCinema(showtimeCinemaDateMatch[1], showtimeCinemaDateMatch[2]);

  const userBookingsMatch = path.match(/^\/bookings\/(?:history\/)?user\/(\d+)$/);
  if (userBookingsMatch) {
    const items = mockBookings.filter((booking) => Number(booking.userId) === Number(userBookingsMatch[1]));
    return pageResult(items, params);
  }

  const bookingCodeMatch = path.match(/^\/bookings\/code\/(.+)$/);
  if (bookingCodeMatch) {
    return mockBookings.find((booking) => booking.bookingCode === decodeURIComponent(bookingCodeMatch[1]));
  }

  const bookingStatusMatch = path.match(/^\/bookings\/status\/(.+)$/);
  if (bookingStatusMatch) {
    return mockBookings.filter((booking) => booking.status === decodeURIComponent(bookingStatusMatch[1]));
  }

  const paymentBookingMatch = path.match(/^\/payments\/booking\/(\d+)$/);
  if (paymentBookingMatch) {
    return mockPayments.find((payment) => Number(payment.bookingId) === Number(paymentBookingMatch[1]));
  }

  const notificationUnread = path === '/notifications/unread-count';
  if (notificationUnread) return mockNotifications.filter((item) => !item.read).length;

  const peopleMovieMatch = path.match(/^\/people\/movie\/(\d+)$/);
  if (peopleMovieMatch) {
    return mockMoviePeople.filter((item) => Number(item.movieId) === Number(peopleMovieMatch[1]));
  }

  if (path.startsWith('/revenue')) {
    return {
      totalRevenue: 25750000,
      totalBookings: mockBookings.length,
      totalTickets: mockBookings.reduce((sum, booking) => sum + (booking.seats?.length || 0), 0),
      data: [
        { label: 'Mon', revenue: 3200000 },
        { label: 'Tue', revenue: 4100000 },
        { label: 'Wed', revenue: 3800000 },
        { label: 'Thu', revenue: 5200000 },
      ],
    };
  }

  const list = routeList(path);
  if (list) {
    if (params.page !== undefined || params.size !== undefined) return pageResult(sortItems(list, params.sort), params);
    return list;
  }

  const idMatch = path.match(/^\/([^/]+)\/(\d+)$/);
  if (idMatch) {
    const collection = routeList(`/${idMatch[1]}`);
    if (collection) return findById(collection, idMatch[2]);
  }

  return null;
};

const handleMutation = (method, path, body, params) => {
  if (path === '/auth/login' || path === '/auth/login-google') {
    const login = body.usernameOrEmail || body.email || 'customer';
    const user = login.includes('admin') ? mockUsers[0] : mockUsers[1];
    return createAuthResponse(user);
  }

  if (path === '/auth/register') {
    const user = createItem(mockUsers, {
      username: body.username || body.email?.split('@')[0] || `user${mockUsers.length + 1}`,
      email: body.email,
      fullName: body.fullName || body.name || 'Nguoi dung moi',
      role: 'CUSTOMER',
      roles: [mockRoles[2]],
      isActive: true,
    });
    return createAuthResponse(user);
  }

  if (path.includes('/forget-password') || path.includes('/verify-otp') || path.includes('/resend-otp') || path.includes('/change-password')) {
    return { success: true, message: 'Mock request completed' };
  }

  if (path === '/bookings' && method === 'post') {
    const showtime = mockShowtimes.find((item) => Number(item.id) === Number(body.showtimeId)) || mockShowtimes[0];
    const movie = mockMovies.find((item) => Number(item.id) === Number(showtime.movieId));
    const cinema = mockCinemas.find((item) => Number(item.id) === Number(showtime.cinemaId));
    const room = mockRooms.find((item) => Number(item.id) === Number(showtime.roomId));
    return createItem(mockBookings, {
      bookingCode: `HC${Date.now().toString().slice(-8)}`,
      userId: body.userId || 2,
      userName: 'Khach Hang Demo',
      movieId: movie?.id,
      movieTitle: movie?.title,
      cinemaId: cinema?.id,
      cinemaName: cinema?.name,
      roomId: room?.id,
      roomName: room?.name,
      showtimeId: showtime.id,
      showDate: showtime.date,
      showTime: showtime.startTime,
      seatIds: body.seatIds || [],
      seats: body.seats || body.seatNames || [],
      seatNames: body.seatNames || body.seats || [],
      totalAmount: body.totalAmount || 0,
      paymentMethod: body.paymentMethod || 'CASH',
      paymentStatus: body.paymentStatus || 'PENDING',
      status: 'pending',
    });
  }

  if (path === '/payments' && method === 'post') {
    return createItem(mockPayments, {
      bookingId: body.bookingId,
      amount: body.amount || body.totalAmount || 0,
      method: body.paymentMethod || body.method || 'CASH',
      status: 'PAID',
      transactionId: `MOCK-${Date.now()}`,
    });
  }

  const collectionMap = {
    movies: mockMovies,
    cinemas: mockCinemas,
    rooms: mockRooms,
    showtime: mockShowtimes,
    bookings: mockBookings,
    users: mockUsers,
    roles: mockRoles,
    permissions: mockPermissions,
    promotions: mockPromotions,
    notifications: mockNotifications,
    people: mockPeople,
    payments: mockPayments,
  };

  const rootMatch = path.match(/^\/([^/]+)$/);
  if (rootMatch && collectionMap[rootMatch[1]] && method === 'post') {
    return createItem(collectionMap[rootMatch[1]], body);
  }

  const idMatch = path.match(/^\/([^/]+)\/(\d+)(?:\/.*)?$/);
  if (idMatch && collectionMap[idMatch[1]]) {
    const collection = collectionMap[idMatch[1]];
    const id = idMatch[2];

    if (method === 'delete') {
      const index = collection.findIndex((item) => Number(item.id) === Number(id));
      if (index >= 0) collection.splice(index, 1);
      return { success: true };
    }

    if (path.endsWith('/activate')) return updateItem(collection, id, { isActive: true, status: 'ACTIVE' });
    if (path.endsWith('/deactivate')) return updateItem(collection, id, { isActive: false, status: 'INACTIVE' });
    if (path.endsWith('/read')) return updateItem(collection, id, { read: true });
    if (path.includes('/status')) return updateItem(collection, id, { status: params.status || body.status || body });

    return updateItem(collection, id, body);
  }

  if (path === '/notifications/read-all') {
    mockNotifications.forEach((item) => {
      item.read = true;
    });
    return { success: true };
  }

  return { success: true };
};

const routeMock = (config) => {
  const method = (config.method || 'get').toLowerCase();
  const path = normalizePath(config);
  const params = getParams(config);
  const body = parseBody(config.data);

  if (method === 'get') return handleGet(path, params);
  return handleMutation(method, path, body, params);
};

export const createMockAdapter = ({ delay = 200 } = {}) => async (config) => {
  await wait(delay);
  const data = routeMock(config);

  if (data === null || data === undefined) {
    return {
      data: { success: false, message: `Mock endpoint not found: ${config.method?.toUpperCase() || 'GET'} ${normalizePath(config)}` },
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config,
      request: {},
    };
  }

  return {
    data: { success: true, data: clone(data) },
    status: 200,
    statusText: 'OK',
    headers: { 'x-hotcinema-mock': 'true' },
    config,
    request: {},
  };
};
