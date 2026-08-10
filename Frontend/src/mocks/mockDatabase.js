import { MOCK_DATABASE_STORAGE_KEY } from '@/mocks/mockConfig';

const clone = (value) => JSON.parse(JSON.stringify(value));

const isoDate = (offset = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const isoDateTime = (offset = 0, hour = 10, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const mockImage = (title, variant = 'poster') => {
  const width = variant === 'poster' ? 600 : 1400;
  const height = variant === 'poster' ? 900 : 620;
  const safeTitle = String(title || 'HotCinema').replace(/[<>&]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111827"/><stop offset=".52" stop-color="#7c2d12"/><stop offset="1" stop-color="#020617"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${Math.round(width * .72)}" cy="${Math.round(height * .3)}" r="${Math.round(Math.min(width, height) * .2)}" fill="#f97316" opacity=".22"/><text x="50%" y="48%" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="${variant === 'poster' ? 42 : 64}" font-weight="700">${safeTitle}</text><text x="50%" y="55%" text-anchor="middle" fill="#fed7aa" font-family="Arial,sans-serif" font-size="${variant === 'poster' ? 20 : 28}">HOTCINEMA · MOCK DATA</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createMovies = () => [
  {
    id: 1,
    title: 'Hành Trình Cuối Cùng',
    originalTitle: 'The Last Journey',
    description: 'Một phi hành đoàn phải hoàn thành nhiệm vụ cuối cùng trước khi cánh cổng không gian đóng lại.',
    durationMinutes: 128,
    releaseDate: isoDate(-12),
    language: 'Tiếng Anh',
    subtitle: 'Tiếng Việt',
    rating: 'T13',
    averageRating: 8.7,
    posterUrl: mockImage('Hành Trình Cuối Cùng'),
    backdropUrl: mockImage('Hành Trình Cuối Cùng', 'backdrop'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    director: 'Nguyễn Minh',
    actors: ['An Trần', 'Minh Khoa', 'Linh Chi'],
    genres: ['Hành động', 'Khoa học viễn tưởng'],
    status: 'NOW_SHOWING',
    isActive: true,
  },
  {
    id: 2,
    title: 'Mùa Hè Có Em',
    originalTitle: 'Summer With You',
    description: 'Câu chuyện trưởng thành nhẹ nhàng về một nhóm bạn gặp lại nhau sau nhiều năm.',
    durationMinutes: 112,
    releaseDate: isoDate(-5),
    language: 'Tiếng Việt',
    subtitle: '',
    rating: 'K',
    averageRating: 8.1,
    posterUrl: mockImage('Mùa Hè Có Em'),
    backdropUrl: mockImage('Mùa Hè Có Em', 'backdrop'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    director: 'Lê Hoàng',
    actors: ['Hà Vy', 'Quốc Bảo'],
    genres: ['Lãng mạn', 'Drama'],
    status: 'NOW_SHOWING',
    isActive: true,
  },
  {
    id: 3,
    title: 'Thành Phố Bóng Đêm',
    originalTitle: 'Night City',
    description: 'Một thám tử lần theo chuỗi vụ án bí ẩn xảy ra trong thành phố không bao giờ ngủ.',
    durationMinutes: 119,
    releaseDate: isoDate(-20),
    language: 'Tiếng Anh',
    subtitle: 'Tiếng Việt',
    rating: 'T16',
    averageRating: 7.9,
    posterUrl: mockImage('Thành Phố Bóng Đêm'),
    backdropUrl: mockImage('Thành Phố Bóng Đêm', 'backdrop'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    director: 'David Lam',
    actors: ['Kai Nguyen', 'Mia Ho'],
    genres: ['Bí ẩn', 'Giật gân'],
    status: 'NOW_SHOWING',
    isActive: true,
  },
  {
    id: 4,
    title: 'Biệt Đội Tí Hon',
    originalTitle: 'Tiny Heroes',
    description: 'Những người bạn nhỏ bất ngờ trở thành anh hùng khi thành phố gặp nguy hiểm.',
    durationMinutes: 96,
    releaseDate: isoDate(-2),
    language: 'Lồng tiếng Việt',
    subtitle: '',
    rating: 'P',
    averageRating: 8.4,
    posterUrl: mockImage('Biệt Đội Tí Hon'),
    backdropUrl: mockImage('Biệt Đội Tí Hon', 'backdrop'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    director: 'Studio Mock',
    actors: ['Voice Cast'],
    genres: ['Hoạt hình', 'Gia đình'],
    status: 'NOW_SHOWING',
    isActive: true,
  },
  {
    id: 5,
    title: 'Vệt Sáng Phương Nam',
    originalTitle: 'Southern Lights',
    description: 'Một cuộc phiêu lưu xuyên Việt để tìm lại những mảnh ký ức của gia đình.',
    durationMinutes: 124,
    releaseDate: isoDate(12),
    language: 'Tiếng Việt',
    subtitle: 'Tiếng Anh',
    rating: 'T13',
    averageRating: 0,
    posterUrl: mockImage('Vệt Sáng Phương Nam'),
    backdropUrl: mockImage('Vệt Sáng Phương Nam', 'backdrop'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    director: 'Trần Hà',
    actors: ['Gia Huy', 'Thảo Nhi'],
    genres: ['Phiêu lưu', 'Drama'],
    status: 'COMING_SOON',
    isActive: true,
  },
  {
    id: 6,
    title: 'Zero Hour',
    originalTitle: 'Zero Hour',
    description: 'Đội đặc nhiệm có đúng một giờ để ngăn chặn cuộc tấn công quy mô lớn.',
    durationMinutes: 131,
    releaseDate: isoDate(25),
    language: 'Tiếng Anh',
    subtitle: 'Tiếng Việt',
    rating: 'T18',
    averageRating: 0,
    posterUrl: mockImage('Zero Hour'),
    backdropUrl: mockImage('Zero Hour', 'backdrop'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    director: 'Alex Morgan',
    actors: ['Evan Lee', 'Sophia Park'],
    genres: ['Hành động', 'Giật gân'],
    status: 'COMING_SOON',
    isActive: true,
  },
];

const createCinemas = () => [
  { id: 1, name: 'HotCinema Landmark', status: 'ACTIVE', isActive: true, regionId: 1, regionSlug: 'ho-chi-minh', cityId: 1, cityName: 'TP. Hồ Chí Minh', address: '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM', description: 'Cụm rạp trung tâm với IMAX và phòng VIP.', image: mockImage('HotCinema Landmark', 'backdrop'), totalRooms: 3 },
  { id: 2, name: 'HotCinema Crescent', status: 'ACTIVE', isActive: true, regionId: 1, regionSlug: 'ho-chi-minh', cityId: 1, cityName: 'TP. Hồ Chí Minh', address: '101 Tôn Dật Tiên, Quận 7, TP.HCM', description: 'Không gian hiện đại, gần khu mua sắm và ẩm thực.', image: mockImage('HotCinema Crescent', 'backdrop'), totalRooms: 2 },
  { id: 3, name: 'HotCinema Hà Nội Center', status: 'ACTIVE', isActive: true, regionId: 2, regionSlug: 'ha-noi', cityId: 2, cityName: 'Hà Nội', address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội', description: 'Cụm rạp lớn tại trung tâm Hà Nội.', image: mockImage('HotCinema Hà Nội', 'backdrop'), totalRooms: 2 },
  { id: 4, name: 'HotCinema Đà Nẵng', status: 'INACTIVE', isActive: false, regionId: 3, regionSlug: 'da-nang', cityId: 3, cityName: 'Đà Nẵng', address: '2 Hải Phòng, Hải Châu, Đà Nẵng', description: 'Cụm rạp mock đang tạm bảo trì để test trạng thái.', image: mockImage('HotCinema Đà Nẵng', 'backdrop'), totalRooms: 1 },
];

const createRooms = () => [
  { id: 1, cinemaId: 1, name: 'IMAX 01', theaterType: 'IMAX', roomType: 'IMAX', numberOfRows: 8, numberOfColumns: 12, rowsCount: 8, seatsPerRow: 12, screenType: 'IMAX Laser', soundSystem: 'Dolby Atmos', isActive: true, status: 'ACTIVE', totalSeats: 96 },
  { id: 2, cinemaId: 1, name: 'Cinema 02', theaterType: 'STANDARD_2D', roomType: 'STANDARD_2D', numberOfRows: 8, numberOfColumns: 10, rowsCount: 8, seatsPerRow: 10, screenType: '2D', soundSystem: 'Dolby 7.1', isActive: true, status: 'ACTIVE', totalSeats: 80 },
  { id: 3, cinemaId: 1, name: 'VIP Lounge', theaterType: 'VIP', roomType: 'VIP', numberOfRows: 6, numberOfColumns: 8, rowsCount: 6, seatsPerRow: 8, screenType: '2D Premium', soundSystem: 'Dolby Atmos', isActive: true, status: 'ACTIVE', totalSeats: 48 },
  { id: 4, cinemaId: 2, name: 'Cinema 01', theaterType: 'STANDARD_2D', roomType: 'STANDARD_2D', numberOfRows: 8, numberOfColumns: 10, rowsCount: 8, seatsPerRow: 10, screenType: '2D', soundSystem: 'Dolby 7.1', isActive: true, status: 'ACTIVE', totalSeats: 80 },
  { id: 5, cinemaId: 2, name: 'Cinema 3D', theaterType: 'STANDARD_3D', roomType: 'STANDARD_3D', numberOfRows: 7, numberOfColumns: 10, rowsCount: 7, seatsPerRow: 10, screenType: '3D', soundSystem: 'Dolby 7.1', isActive: true, status: 'ACTIVE', totalSeats: 70 },
  { id: 6, cinemaId: 3, name: 'Cinema 01', theaterType: 'STANDARD_2D', roomType: 'STANDARD_2D', numberOfRows: 8, numberOfColumns: 10, rowsCount: 8, seatsPerRow: 10, screenType: '2D', soundSystem: 'Dolby 7.1', isActive: true, status: 'ACTIVE', totalSeats: 80 },
  { id: 7, cinemaId: 3, name: 'VIP Hà Nội', theaterType: 'VIP', roomType: 'VIP', numberOfRows: 6, numberOfColumns: 8, rowsCount: 6, seatsPerRow: 8, screenType: '2D Premium', soundSystem: 'Dolby Atmos', isActive: true, status: 'ACTIVE', totalSeats: 48 },
  { id: 8, cinemaId: 4, name: 'Cinema 01', theaterType: 'STANDARD_2D', roomType: 'STANDARD_2D', numberOfRows: 7, numberOfColumns: 10, rowsCount: 7, seatsPerRow: 10, screenType: '2D', soundSystem: 'Dolby 7.1', isActive: false, status: 'INACTIVE', totalSeats: 70 },
];

const generateSeats = (rooms) => rooms.flatMap((room) => {
  const rows = Number(room.numberOfRows || room.rowsCount || 8);
  const columns = Number(room.numberOfColumns || room.seatsPerRow || 10);
  const seats = [];
  for (let row = 1; row <= rows; row += 1) {
    const rowLabel = String.fromCharCode(64 + row);
    for (let col = 1; col <= columns; col += 1) {
      const id = room.id * 1000 + row * 100 + col;
      const isVip = row >= Math.max(4, rows - 2);
      const isCouple = row === rows && col > columns - 4;
      seats.push({
        id,
        roomId: room.id,
        theaterId: room.id,
        row,
        col,
        rowLabel,
        seatNumber: String(col),
        name: `${rowLabel}${col}`,
        seatType: isCouple ? 'COUPLE' : isVip ? 'VIP' : 'STANDARD',
        type: isCouple ? 'couple' : isVip ? 'vip' : 'standard',
        isActive: !(row === 1 && col === columns),
        status: row === 1 && col === columns ? 'maintenance' : 'available',
        price: isCouple ? 180000 : isVip ? 120000 : 90000,
      });
    }
  }
  return seats;
});

const createShowtimes = (movies, cinemas, rooms) => {
  const definitions = [
    [1, 1, 1, 0, '10:15', '12:23', 145000, 'IMAX'],
    [1, 1, 2, 0, '14:00', '16:08', 105000, 'TWO_D'],
    [1, 2, 4, 0, '18:30', '20:38', 95000, 'TWO_D'],
    [2, 1, 2, 0, '09:30', '11:22', 90000, 'TWO_D'],
    [2, 2, 5, 0, '20:00', '21:52', 125000, 'THREE_D'],
    [3, 1, 3, 0, '21:15', '23:14', 155000, 'VIP'],
    [4, 3, 6, 0, '16:40', '18:16', 90000, 'TWO_D'],
    [1, 1, 1, 1, '11:00', '13:08', 145000, 'IMAX'],
    [1, 2, 4, 1, '17:00', '19:08', 95000, 'TWO_D'],
    [2, 1, 2, 1, '14:30', '16:22', 95000, 'TWO_D'],
    [3, 3, 7, 1, '19:15', '21:14', 150000, 'VIP'],
    [4, 1, 2, 1, '10:00', '11:36', 90000, 'TWO_D'],
    [1, 1, 1, 2, '19:00', '21:08', 155000, 'IMAX'],
    [2, 2, 5, 2, '13:20', '15:12', 120000, 'THREE_D'],
    [3, 1, 2, 2, '22:00', '23:59', 110000, 'TWO_D'],
  ];
  return definitions.map(([movieId, cinemaId, roomId, dayOffset, startTime, endTime, basePrice, format], index) => {
    const movie = movies.find((item) => item.id === movieId);
    const cinema = cinemas.find((item) => item.id === cinemaId);
    const room = rooms.find((item) => item.id === roomId);
    return {
      id: 101 + index,
      showtimeId: 101 + index,
      movieId,
      movieTitle: movie?.title,
      moviePoster: movie?.posterUrl,
      posterUrl: movie?.posterUrl,
      cinemaId,
      cinemaName: cinema?.name,
      cinemaAddress: cinema?.address,
      theaterId: roomId,
      roomId,
      roomName: room?.name,
      showDate: isoDate(dayOffset),
      date: isoDate(dayOffset),
      showtimeDate: isoDate(dayOffset),
      startTime,
      endTime,
      basePrice,
      price: basePrice,
      status: index === 2 ? 'ALMOST_FULL' : 'AVAILABLE',
      format,
      formatType: format,
      audioType: movie?.language === 'Tiếng Việt' ? 'VIETNAMESE' : 'SUBTITLE',
    };
  });
};

const createUsers = () => [
  { id: 1, username: 'admin', fullName: 'HotCinema Admin', email: 'admin@hotcinema.vn', phoneNumber: '0901000001', birthDate: '1995-05-20', avatarUrl: '', role: 'ADMIN', roles: [{ id: 1, name: 'ADMIN' }], status: 'ACTIVE', isActive: true, createdAt: isoDateTime(-120) },
  { id: 2, username: 'customer', fullName: 'Nguyễn Khách Hàng', email: 'customer@hotcinema.vn', phoneNumber: '0901000002', birthDate: '2000-08-18', avatarUrl: '', role: 'CUSTOMER', roles: [{ id: 3, name: 'CUSTOMER' }], status: 'ACTIVE', isActive: true, createdAt: isoDateTime(-80) },
  { id: 3, username: 'staff01', fullName: 'Trần Nhân Viên', email: 'staff@hotcinema.vn', phoneNumber: '0901000003', birthDate: '1998-03-11', avatarUrl: '', role: 'STAFF', roles: [{ id: 2, name: 'STAFF' }], status: 'ACTIVE', isActive: true, createdAt: isoDateTime(-60) },
  { id: 4, username: 'linhchi', fullName: 'Linh Chi', email: 'linhchi@example.com', phoneNumber: '0901000004', role: 'CUSTOMER', roles: [{ id: 3, name: 'CUSTOMER' }], status: 'ACTIVE', isActive: true, createdAt: isoDateTime(-30) },
  { id: 5, username: 'minhkhoa', fullName: 'Minh Khoa', email: 'minhkhoa@example.com', phoneNumber: '0901000005', role: 'CUSTOMER', roles: [{ id: 3, name: 'CUSTOMER' }], status: 'INACTIVE', isActive: false, createdAt: isoDateTime(-15) },
];

const createPromotions = () => [
  { id: 1, code: 'HOT20', name: 'HotCinema 20%', description: 'Giảm 20% cho đơn đặt vé mock.', discountType: 'PERCENTAGE', discountValue: 20, minPurchase: 100000, maxDiscount: 100000, startDate: isoDate(-30), endDate: isoDate(30), usageLimit: 500, usedCount: 126, status: 'ACTIVE', isActive: true },
  { id: 2, code: 'WELCOME50', name: 'Khách mới 50K', description: 'Giảm trực tiếp 50.000đ.', discountType: 'FIXED_AMOUNT', discountValue: 50000, minPurchase: 150000, maxDiscount: 50000, startDate: isoDate(-10), endDate: isoDate(45), usageLimit: 200, usedCount: 38, status: 'ACTIVE', isActive: true },
  { id: 3, code: 'OLD10', name: 'Chiến dịch cũ', description: 'Dữ liệu hết hạn để test trạng thái.', discountType: 'PERCENTAGE', discountValue: 10, minPurchase: 0, maxDiscount: 50000, startDate: isoDate(-80), endDate: isoDate(-3), usageLimit: 100, usedCount: 100, status: 'INACTIVE', isActive: false },
];

const createConcessions = () => [
  { id: 1, name: 'Bắp rang bơ lớn', category: 'FOOD', price: 69000, originalPrice: 75000, stock: 42, description: 'Bắp rang vị bơ size lớn.', image: mockImage('Bắp Rang'), isPopular: true },
  { id: 2, name: 'Pepsi lớn', category: 'DRINK', price: 45000, originalPrice: 45000, stock: 8, description: 'Nước ngọt size lớn.', image: mockImage('Pepsi'), isPopular: false },
  { id: 3, name: 'Combo Couple', category: 'COMBO', price: 159000, originalPrice: 179000, stock: 24, description: '2 nước + 1 bắp lớn.', image: mockImage('Combo Couple'), isPopular: true },
  { id: 4, name: 'Nachos phô mai', category: 'FOOD', price: 79000, originalPrice: 79000, stock: 0, description: 'Dữ liệu hết hàng để test UI.', image: mockImage('Nachos'), isPopular: false },
];

const createPermissions = () => [
  { id: 1, name: 'MOVIE_READ', description: 'Xem phim' },
  { id: 2, name: 'MOVIE_WRITE', description: 'Quản lý phim' },
  { id: 3, name: 'CINEMA_WRITE', description: 'Quản lý rạp' },
  { id: 4, name: 'BOOKING_READ', description: 'Xem booking' },
  { id: 5, name: 'BOOKING_WRITE', description: 'Quản lý booking' },
  { id: 6, name: 'USER_WRITE', description: 'Quản lý người dùng' },
  { id: 7, name: 'REPORT_READ', description: 'Xem báo cáo' },
  { id: 8, name: 'SETTINGS_WRITE', description: 'Quản lý cài đặt' },
];

const createRoles = (permissions) => [
  { id: 1, name: 'ADMIN', description: 'Quản trị toàn hệ thống', active: true, permissions: clone(permissions), userCount: 1 },
  { id: 2, name: 'STAFF', description: 'Nhân viên rạp', active: true, permissions: clone(permissions.filter((item) => [1, 4, 5].includes(item.id))), userCount: 1 },
  { id: 3, name: 'CUSTOMER', description: 'Khách hàng', active: true, permissions: clone(permissions.filter((item) => item.id === 1)), userCount: 3 },
];

export const createSeedMockDatabase = () => {
  const movies = createMovies();
  const cinemas = createCinemas();
  const rooms = createRooms();
  const seats = generateSeats(rooms);
  const showtimes = createShowtimes(movies, cinemas, rooms);
  const users = createUsers();
  const permissions = createPermissions();

  return {
    version: 1,
    movies,
    cinemas,
    rooms,
    seats,
    showtimes,
    users,
    regions: [
      { id: 1, name: 'TP. Hồ Chí Minh', slug: 'ho-chi-minh', isActive: true },
      { id: 2, name: 'Hà Nội', slug: 'ha-noi', isActive: true },
      { id: 3, name: 'Đà Nẵng', slug: 'da-nang', isActive: true },
    ],
    cities: [
      { id: 1, name: 'TP. Hồ Chí Minh', regionId: 1 },
      { id: 2, name: 'Hà Nội', regionId: 2 },
      { id: 3, name: 'Đà Nẵng', regionId: 3 },
    ],
    promotions: createPromotions(),
    concessions: createConcessions(),
    permissions,
    roles: createRoles(permissions),
    notifications: [
      { id: 1, userId: 1, title: 'Báo cáo doanh thu', content: 'Doanh thu hôm nay đang cao hơn hôm qua 12%.', type: 'REPORT', read: false, isRead: false, createdAt: isoDateTime(0, 9, 10) },
      { id: 2, userId: 1, title: 'Suất chiếu sắp đầy', content: 'Suất Hành Trình Cuối Cùng lúc 18:30 đang sắp hết chỗ.', type: 'BOOKING', read: false, isRead: false, createdAt: isoDateTime(0, 8, 40) },
      { id: 3, userId: 2, title: 'Đặt vé thành công', content: 'Vé mock của bạn đã được xác nhận.', type: 'BOOKING', read: false, isRead: false, createdAt: isoDateTime(-1, 20, 0) },
      { id: 4, userId: 2, title: 'Khuyến mãi HOT20', content: 'Dùng mã HOT20 để giảm 20% cho đơn đặt vé.', type: 'PROMOTION', read: true, isRead: true, createdAt: isoDateTime(-2, 10, 0) },
    ],
    reviews: [
      { id: 1, movieId: 1, userId: 2, userName: 'Nguyễn Khách Hàng', rating: 5, comment: 'Hình ảnh rất đẹp, âm thanh IMAX tốt.', content: 'Hình ảnh rất đẹp, âm thanh IMAX tốt.', status: 'APPROVED', createdAt: isoDateTime(-2) },
      { id: 2, movieId: 1, userId: 4, userName: 'Linh Chi', rating: 4, comment: 'Nhịp phim tốt, đoạn cuối hơi nhanh.', content: 'Nhịp phim tốt, đoạn cuối hơi nhanh.', status: 'PENDING', createdAt: isoDateTime(-1) },
      { id: 3, movieId: 2, userId: 4, userName: 'Linh Chi', rating: 5, comment: 'Phim nhẹ nhàng, hợp xem cuối tuần.', content: 'Phim nhẹ nhàng, hợp xem cuối tuần.', status: 'APPROVED', createdAt: isoDateTime(-4) },
    ],
    bookings: [
      { id: 1001, bookingId: 1001, bookingCode: 'HC260810A1', userId: 2, showtimeId: 101, movieId: 1, movieTitle: 'Hành Trình Cuối Cùng', cinemaId: 1, cinemaName: 'HotCinema Landmark', cinemaAddress: '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM', roomId: 1, roomName: 'IMAX 01', showDate: isoDate(-1), startTime: '19:00', endTime: '21:08', status: 'CONFIRMED', bookingStatus: 'CONFIRMED', paymentStatus: 'SUCCESS', totalAmount: 290000, finalAmount: 290000, seats: [{ id: 1101, name: 'A1', seatName: 'A1', seatType: 'STANDARD', price: 145000 }, { id: 1102, name: 'A2', seatName: 'A2', seatType: 'STANDARD', price: 145000 }], createdAt: isoDateTime(-2, 18, 30) },
      { id: 1002, bookingId: 1002, bookingCode: 'HC260810B2', userId: 2, showtimeId: 104, movieId: 2, movieTitle: 'Mùa Hè Có Em', cinemaId: 1, cinemaName: 'HotCinema Landmark', cinemaAddress: '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM', roomId: 2, roomName: 'Cinema 02', showDate: isoDate(1), startTime: '14:30', endTime: '16:22', status: 'PENDING', bookingStatus: 'PENDING', paymentStatus: 'PENDING', totalAmount: 180000, finalAmount: 180000, seats: [{ id: 2101, name: 'A1', seatName: 'A1', seatType: 'STANDARD', price: 90000 }, { id: 2102, name: 'A2', seatName: 'A2', seatType: 'STANDARD', price: 90000 }], createdAt: isoDateTime(0, 11, 0) },
      { id: 1003, bookingId: 1003, bookingCode: 'HC260810C3', userId: 4, showtimeId: 105, movieId: 2, movieTitle: 'Mùa Hè Có Em', cinemaId: 2, cinemaName: 'HotCinema Crescent', cinemaAddress: '101 Tôn Dật Tiên, Quận 7, TP.HCM', roomId: 5, roomName: 'Cinema 3D', showDate: isoDate(-3), startTime: '20:00', endTime: '21:52', status: 'CANCELLED', bookingStatus: 'CANCELLED', paymentStatus: 'CANCELLED', totalAmount: 250000, finalAmount: 250000, seats: [{ id: 5101, name: 'A1', seatName: 'A1', seatType: 'STANDARD', price: 125000 }, { id: 5102, name: 'A2', seatName: 'A2', seatType: 'STANDARD', price: 125000 }], createdAt: isoDateTime(-5, 17, 0) },
    ],
    payments: [
      { id: 501, bookingId: 1001, bookingCode: 'HC260810A1', transactionId: 'MOCK-MOMO-501', amount: 290000, paymentMethod: 'MOMO', method: 'MOMO', status: 'SUCCESS', createdAt: isoDateTime(-2, 18, 35), paidAt: isoDateTime(-2, 18, 36) },
      { id: 502, bookingId: 1002, bookingCode: 'HC260810B2', transactionId: 'MOCK-PENDING-502', amount: 180000, paymentMethod: 'MOMO', method: 'MOMO', status: 'PENDING', createdAt: isoDateTime(0, 11, 2) },
      { id: 503, bookingId: 1003, bookingCode: 'HC260810C3', transactionId: 'MOCK-CANCEL-503', amount: 250000, paymentMethod: 'VNPAY', method: 'VNPAY', status: 'CANCELLED', createdAt: isoDateTime(-5, 17, 5) },
    ],
    settings: {
      pricing: { standardSeatPrice: 90000, vipSeatPrice: 120000, coupleSeatPrice: 180000, weekendSurcharge: 10000 },
      company: { name: 'HotCinema', hotline: '1900 2026', email: 'support@hotcinema.vn', address: 'TP. Hồ Chí Minh' },
      booking: { holdMinutes: 10, maxSeatsPerBooking: 10, allowCancellation: true, cancellationHours: 2 },
      system: { maintenanceMode: false, enableRegistration: true, defaultLanguage: 'vi' },
      cinema: { defaultScreenType: '2D', defaultSoundSystem: 'Dolby 7.1' },
      payment: { enabledMethods: ['MOMO', 'VNPAY', 'CASH'] },
    },
  };
};

let runtimeDatabase = null;

export const getMockDatabase = () => {
  if (runtimeDatabase) return runtimeDatabase;
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(MOCK_DATABASE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.version === 1) {
          runtimeDatabase = parsed;
          return runtimeDatabase;
        }
      }
    } catch (error) {
      console.warn('[Mock API] Could not restore mock database, using seed data.', error);
    }
  }
  runtimeDatabase = createSeedMockDatabase();
  return runtimeDatabase;
};

export const persistMockDatabase = () => {
  if (typeof window === 'undefined' || !runtimeDatabase) return;
  try {
    window.localStorage.setItem(MOCK_DATABASE_STORAGE_KEY, JSON.stringify(runtimeDatabase));
  } catch (error) {
    console.warn('[Mock API] Could not persist mock database.', error);
  }
};

export const resetRuntimeMockDatabase = () => {
  runtimeDatabase = createSeedMockDatabase();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MOCK_DATABASE_STORAGE_KEY, JSON.stringify(runtimeDatabase));
  }
  return runtimeDatabase;
};

export { isoDate, isoDateTime, mockImage };
