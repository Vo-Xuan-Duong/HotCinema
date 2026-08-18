// Runtime API configuration
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');

// API endpoints. Keep UI vocabulary independent from backend naming by aliasing
// resources here instead of scattering path strings across page components.
export const ENDPOINTS = {
  MOVIES: '/movies',
  CINEMAS: '/cinemas',
  SHOWTIME: '/showtimes',
  SHOWTIMES: '/showtimes',
  BOOKINGS: '/bookings',
  USERS: '/users',
  AUTH: '/auth',
  NOTIFICATIONS: '/notifications',
  CITIES: '/cities',
  REGIONS: '/regions',
  CINEMA_CLUSTERS: '/cinema-clusters',
  SEATS: '/seats',
  SEAT_TYPES: '/seattypes',
  ROOMS: '/auditoriums',
  AUDITORIUMS: '/auditoriums',
  SHOWTIMESEATS: '/showtimeseats',
  PROMOTIONS: '/promotions',
  PROMOTION_CODES: '/promotioncodes',
  VOUCHERS: '/vouchers',
  PAYMENTS: '/payments',
  PRODUCTS: '/products',
  PRODUCT_CATEGORIES: '/productcategories',
  CINEMA_PRODUCTS: '/cinemaproducts',
  REPORTS: '/reports',
  ROLES: '/roles',
  PERMISSIONS: '/permissions'
};

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
  P: 'P - Mọi lứa tuổi',
  K: 'K - Dưới 13 tuổi xem cùng cha mẹ/người giám hộ',
  T13: 'T13 - Từ 13 tuổi',
  T16: 'T16 - Từ 16 tuổi',
  T18: 'T18 - Từ 18 tuổi'
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
  STANDARD: 'STANDARD',
  IMAX: 'IMAX',
  TYPE_4DX: 'TYPE_4DX',
  SCREENX: 'SCREENX'
};

// Room Types Display (Frontend format)
export const ROOM_TYPES_DISPLAY = {
  '2D': 'STANDARD',
  IMAX: 'IMAX',
  '4DX': 'TYPE_4DX',
  SCREENX: 'SCREENX'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  E_WALLET: 'E_WALLET',
  QR_CODE: 'QR_CODE',
  MOMO: 'MOMO',
  VNPAY: 'VNPAY',
  ZALOPAY: 'ZALOPAY'
};

// Booking Status (backend enum format)
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  THEATER_MANAGER: 'THEATER_MANAGER',
  ADMIN: 'ADMIN'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  USER_ID: 'user_id',
  CART_ITEMS: 'cart_items',
  THEME: 'theme',
  LANGUAGE: 'language',
  REMEMBER_EMAIL: 'remembered_email',
  PENDING_PAYMENT: 'pendingPayment',
  LAST_BOOKING: 'lastBooking'
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
