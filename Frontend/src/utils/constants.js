// API Endpoints
export const API_BASE_URL = 'https://api.hotcinemas.vn';
export const ENDPOINTS = {
  MOVIES: '/movies',
  CINEMAS: '/cinemas',
  SHOWTIME: '/showtime',
  BOOKINGS: '/bookings',
  USERS: '/users',
  AUTH: '/auth',
  NOTIFICATIONS: '/notifications',
  CITIES: '/cities',
  REGIONS: '/regions',
  CINEMA_CLUSTERS: '/cinema-clusters',
  SEATS: '/seats',
  ROOMS: '/rooms',
  SHOWTIMESEATS: '/showtime-seats',
  PROMOTIONS: '/promotions',
  VOUCHERS: '/vouchers',
  PAYMENTS: '/payments',
  REPORTS: '/reports',
  ROLES: '/roles',
  PERMISSIONS: '/permissions'
};

export const API_ENDPOINTS = ENDPOINTS; // Backward compatibility

// Movie Categories
export const MOVIE_CATEGORIES = {
  NOW_SHOWING: 'nowShowing',
  COMING_SOON: 'comingSoon',
  TOP_RATED: 'topRated'
};

// Movie Genres
export const MOVIE_GENRES = [
  'Hành động',
  'Phiêu lưu',
  'Hoạt hình',
  'Hài',
  'Tội phạm',
  'Tài liệu',
  'Drama',
  'Gia đình',
  'Kinh dị',
  'Âm nhạc',
  'Bí ẩn',
  'Lãng mạn',
  'Khoa học viễn tưởng',
  'Thể thao',
  'Giật gân',
  'Chiến tranh'
];

// Age Ratings
export const AGE_RATINGS = {
  G: 'G - Mọi lứa tuổi',
  PG: 'PG - Có sự hướng dẫn của phụ huynh',
  PG13: 'PG-13 - Không khuyến khích cho trẻ dưới 13 tuổi',
  R: 'R - Hạn chế cho trẻ dưới 17 tuổi',
  NC17: 'NC-17 - Chỉ dành cho người từ 17 tuổi trở lên'
};

// Seat Types
export const SEAT_TYPES = {
  STANDARD: 'standard',
  VIP: 'vip',
  COUPLE: 'couple',
  WHEELCHAIR: 'wheelchair'
};

// Room Types (Backend format)
export const ROOM_TYPES = {
  STANDARD_2D: 'STANDARD_2D',
  STANDARD_3D: 'STANDARD_3D',
  IMAX: 'IMAX',
  VIP: 'VIP'
};

// Room Types Display (Frontend format)
export const ROOM_TYPES_DISPLAY = {
  '2D': '2D',
  '3D': '3D',
  'IMAX': 'IMAX',
  'VIP': 'VIP'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
  QR_CODE: 'qr_code'
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_TOKEN: 'user_token', // Legacy key for backward compatibility
  USER_INFO: 'user_info',
  USER_ID: 'user_id',
  CART_ITEMS: 'cart_items',
  THEME: 'theme',
  LANGUAGE: 'language',
  REMEMBER_EMAIL: 'remembered_email'
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  ACCENT: '#ff6b6b',
  SUCCESS: '#51cf66',
  WARNING: '#feca57',
  ERROR: '#ff6b6b',
  INFO: '#3498db'
};

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: '480px',
  TABLET: '768px',
  DESKTOP: '1024px',
  LARGE_DESKTOP: '1200px'
};

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: '0.2s',
  NORMAL: '0.3s',
  SLOW: '0.5s'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng thử lại.',
  UNAUTHORIZED: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền truy cập trang này.',
  NOT_FOUND: 'Không tìm thấy thông tin bạn yêu cầu.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_SUCCESS: 'Đặt vé thành công!',
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  REGISTER_SUCCESS: 'Đăng ký thành công!',
  UPDATE_SUCCESS: 'Cập nhật thành công!',
  DELETE_SUCCESS: 'Xóa thành công!'
}; 