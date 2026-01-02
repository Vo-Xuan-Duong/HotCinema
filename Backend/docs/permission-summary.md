# TỔNG HỢP PERMISSIONS - HỆ THỐNG HOTCINEMAS

## BẢNG TỔNG HỢP NHANH

### Tổng quan
- **Tổng số Permissions**: 120
- **Số Module**: 17
- **Số Role mặc định**: 3 (Admin, Staff, User)

---

## DANH SÁCH ĐẦY ĐỦ 120 PERMISSIONS

| STT | Module | Permission Name | Mô tả | Admin | Staff | User |
|-----|--------|-----------------|-------|-------|-------|------|
| **USER MANAGEMENT** |
| 1 | User | USER_CREATE | Tạo người dùng mới | ✓ | ✗ | ✗ |
| 2 | User | USER_READ | Xem thông tin người dùng | ✓ | ✓ | ✗ |
| 3 | User | USER_LIST | Xem danh sách người dùng | ✓ | ✓ | ✗ |
| 4 | User | USER_UPDATE | Cập nhật thông tin người dùng | ✓ | ✗ | ✗ |
| 5 | User | USER_DELETE | Xóa người dùng | ✓ | ✗ | ✗ |
| 6 | User | USER_CHANGE_PASSWORD | Đổi mật khẩu người dùng | ✓ | ✗ | ✓ |
| 7 | User | USER_CHANGE_AVATAR | Đổi ảnh đại diện | ✓ | ✗ | ✓ |
| 8 | User | USER_CHANGE_ROLE | Thay đổi vai trò người dùng | ✓ | ✗ | ✗ |
| 9 | User | USER_ACTIVATE | Kích hoạt tài khoản | ✓ | ✗ | ✗ |
| 10 | User | USER_DEACTIVATE | Vô hiệu hóa tài khoản | ✓ | ✗ | ✗ |
| 11 | User | USER_SEARCH | Tìm kiếm người dùng | ✓ | ✓ | ✗ |
| 12 | User | USER_PROFILE_VIEW | Xem profile cá nhân | ✓ | ✓ | ✓ |
| 13 | User | USER_PROFILE_UPDATE | Cập nhật profile cá nhân | ✓ | ✓ | ✓ |
| **ROLE MANAGEMENT** |
| 14 | Role | ROLE_CREATE | Tạo vai trò mới | ✓ | ✗ | ✗ |
| 15 | Role | ROLE_READ | Xem thông tin vai trò | ✓ | ✗ | ✗ |
| 16 | Role | ROLE_LIST | Xem danh sách vai trò | ✓ | ✗ | ✗ |
| 17 | Role | ROLE_UPDATE | Cập nhật vai trò | ✓ | ✗ | ✗ |
| 18 | Role | ROLE_DELETE | Xóa vai trò | ✓ | ✗ | ✗ |
| 19 | Role | ROLE_ACTIVATE | Kích hoạt vai trò | ✓ | ✗ | ✗ |
| 20 | Role | ROLE_DEACTIVATE | Vô hiệu hóa vai trò | ✓ | ✗ | ✗ |
| 21 | Role | ROLE_ADD_PERMISSION | Thêm quyền vào vai trò | ✓ | ✗ | ✗ |
| 22 | Role | ROLE_REMOVE_PERMISSION | Xóa quyền khỏi vai trò | ✓ | ✗ | ✗ |
| **PERMISSION MANAGEMENT** |
| 23 | Permission | PERMISSION_CREATE | Tạo quyền mới | ✓ | ✗ | ✗ |
| 24 | Permission | PERMISSION_READ | Xem thông tin quyền | ✓ | ✓ | ✗ |
| 25 | Permission | PERMISSION_LIST | Xem danh sách quyền | ✓ | ✓ | ✗ |
| 26 | Permission | PERMISSION_UPDATE | Cập nhật quyền | ✓ | ✗ | ✗ |
| 27 | Permission | PERMISSION_DELETE | Xóa quyền | ✓ | ✗ | ✗ |
| **MOVIE MANAGEMENT** |
| 28 | Movie | MOVIE_CREATE | Tạo phim mới | ✓ | ✓ | ✗ |
| 29 | Movie | MOVIE_READ | Xem thông tin phim | ✓ | ✓ | ✓ |
| 30 | Movie | MOVIE_LIST | Xem danh sách phim | ✓ | ✓ | ✓ |
| 31 | Movie | MOVIE_UPDATE | Cập nhật thông tin phim | ✓ | ✓ | ✗ |
| 32 | Movie | MOVIE_DELETE | Xóa phim | ✓ | ✗ | ✗ |
| 33 | Movie | MOVIE_SEARCH | Tìm kiếm phim | ✓ | ✓ | ✓ |
| 34 | Movie | MOVIE_VIEW_COMING_SOON | Xem phim sắp chiếu | ✓ | ✓ | ✓ |
| 35 | Movie | MOVIE_VIEW_NOW_SHOWING | Xem phim đang chiếu | ✓ | ✓ | ✓ |
| 36 | Movie | MOVIE_VIEW_TOP_RATED | Xem phim đánh giá cao | ✓ | ✓ | ✓ |
| **CINEMA MANAGEMENT** |
| 37 | Cinema | CINEMA_CREATE | Tạo rạp mới | ✓ | ✗ | ✗ |
| 38 | Cinema | CINEMA_READ | Xem thông tin rạp | ✓ | ✓ | ✓ |
| 39 | Cinema | CINEMA_LIST | Xem danh sách rạp | ✓ | ✓ | ✓ |
| 40 | Cinema | CINEMA_UPDATE | Cập nhật thông tin rạp | ✓ | ✗ | ✗ |
| 41 | Cinema | CINEMA_DELETE | Xóa rạp | ✓ | ✗ | ✗ |
| 42 | Cinema | CINEMA_SEARCH_BY_REGION | Tìm rạp theo khu vực | ✓ | ✓ | ✓ |
| 43 | Cinema | CINEMA_SEARCH_BY_MOVIE | Tìm rạp chiếu phim | ✓ | ✓ | ✓ |
| **THEATER MANAGEMENT** |
| 44 | Theater | THEATER_CREATE | Tạo phòng chiếu mới | ✓ | ✓ | ✗ |
| 45 | Theater | THEATER_READ | Xem thông tin phòng chiếu | ✓ | ✓ | ✓ |
| 46 | Theater | THEATER_LIST | Xem danh sách phòng chiếu | ✓ | ✓ | ✓ |
| 47 | Theater | THEATER_UPDATE | Cập nhật phòng chiếu | ✓ | ✓ | ✗ |
| 48 | Theater | THEATER_DELETE | Xóa phòng chiếu | ✓ | ✗ | ✗ |
| 49 | Theater | THEATER_DELETE_BY_CINEMA | Xóa tất cả phòng chiếu của rạp | ✓ | ✗ | ✗ |
| 50 | Theater | THEATER_LIST_BY_CINEMA | Xem phòng chiếu theo rạp | ✓ | ✓ | ✓ |
| **SEAT MANAGEMENT** |
| 51 | Seat | SEAT_CREATE | Tạo ghế mới | ✓ | ✓ | ✗ |
| 52 | Seat | SEAT_READ | Xem thông tin ghế | ✓ | ✓ | ✓ |
| 53 | Seat | SEAT_LIST | Xem danh sách ghế | ✓ | ✓ | ✓ |
| 54 | Seat | SEAT_UPDATE | Cập nhật thông tin ghế | ✓ | ✓ | ✗ |
| 55 | Seat | SEAT_DELETE | Xóa ghế | ✓ | ✗ | ✗ |
| 56 | Seat | SEAT_CREATE_BULK | Tạo hàng loạt ghế | ✓ | ✓ | ✗ |
| 57 | Seat | SEAT_DELETE_BY_THEATER | Xóa tất cả ghế của phòng chiếu | ✓ | ✗ | ✗ |
| 58 | Seat | SEAT_LIST_BY_THEATER | Xem ghế theo phòng chiếu | ✓ | ✓ | ✓ |
| **SHOWTIME MANAGEMENT** |
| 59 | Showtime | SHOWTIME_CREATE | Tạo lịch chiếu mới | ✓ | ✓ | ✗ |
| 60 | Showtime | SHOWTIME_READ | Xem thông tin lịch chiếu | ✓ | ✓ | ✓ |
| 61 | Showtime | SHOWTIME_LIST | Xem danh sách lịch chiếu | ✓ | ✓ | ✓ |
| 62 | Showtime | SHOWTIME_UPDATE | Cập nhật lịch chiếu | ✓ | ✓ | ✗ |
| 63 | Showtime | SHOWTIME_DELETE | Xóa lịch chiếu | ✓ | ✓ | ✗ |
| 64 | Showtime | SHOWTIME_UPDATE_STATUS | Cập nhật trạng thái lịch chiếu | ✓ | ✓ | ✗ |
| 65 | Showtime | SHOWTIME_DELETE_BY_MOVIE | Xóa lịch chiếu theo phim | ✓ | ✗ | ✗ |
| 66 | Showtime | SHOWTIME_DELETE_BY_THEATER | Xóa lịch chiếu theo phòng chiếu | ✓ | ✗ | ✗ |
| 67 | Showtime | SHOWTIME_LOCK_SEAT | Khóa ghế trong lịch chiếu | ✓ | ✓ | ✗ |
| 68 | Showtime | SHOWTIME_UNLOCK_SEAT | Mở khóa ghế trong lịch chiếu | ✓ | ✓ | ✗ |
| 69 | Showtime | SHOWTIME_SEARCH | Tìm kiếm lịch chiếu | ✓ | ✓ | ✓ |
| 70 | Showtime | SHOWTIME_BY_MOVIE | Xem lịch chiếu theo phim | ✓ | ✓ | ✓ |
| 71 | Showtime | SHOWTIME_BY_THEATER | Xem lịch chiếu theo phòng chiếu | ✓ | ✓ | ✓ |
| **BOOKING MANAGEMENT** |
| 72 | Booking | BOOKING_CREATE | Tạo đơn đặt vé | ✓ | ✓ | ✓ |
| 73 | Booking | BOOKING_READ | Xem thông tin đặt vé | ✓ | ✓ | ✓* |
| 74 | Booking | BOOKING_LIST | Xem danh sách đặt vé | ✓ | ✓ | ✗ |
| 75 | Booking | BOOKING_UPDATE | Cập nhật đặt vé | ✓ | ✗ | ✗ |
| 76 | Booking | BOOKING_DELETE | Hủy đặt vé | ✓ | ✗ | ✗ |
| 77 | Booking | BOOKING_UPDATE_STATUS | Cập nhật trạng thái đặt vé | ✓ | ✓ | ✗ |
| 78 | Booking | BOOKING_CONFIRM | Xác nhận đặt vé | ✓ | ✓ | ✗ |
| 79 | Booking | BOOKING_CANCEL | Hủy đặt vé | ✓ | ✓ | ✓* |
| 80 | Booking | BOOKING_LIST_BY_USER | Xem đặt vé của người dùng | ✓ | ✓ | ✗ |
| 81 | Booking | BOOKING_LIST_BY_SHOWTIME | Xem đặt vé theo lịch chiếu | ✓ | ✓ | ✗ |
| 82 | Booking | BOOKING_MY_BOOKINGS | Xem đơn đặt vé của tôi | ✓ | ✓ | ✓ |
| **PAYMENT MANAGEMENT** |
| 83 | Payment | PAYMENT_CREATE | Tạo giao dịch thanh toán | ✓ | ✓ | ✓* |
| 84 | Payment | PAYMENT_READ | Xem thông tin thanh toán | ✓ | ✓ | ✓* |
| 85 | Payment | PAYMENT_LIST | Xem danh sách thanh toán | ✓ | ✓ | ✗ |
| 86 | Payment | PAYMENT_UPDATE | Cập nhật thanh toán | ✓ | ✗ | ✗ |
| 87 | Payment | PAYMENT_DELETE | Xóa giao dịch thanh toán | ✓ | ✗ | ✗ |
| 88 | Payment | PAYMENT_CALLBACK | Xử lý callback thanh toán | ✓ | ✗ | ✗ |
| **REVIEW MANAGEMENT** |
| 89 | Review | REVIEW_CREATE | Tạo đánh giá mới | ✓ | ✓ | ✓ |
| 90 | Review | REVIEW_READ | Xem đánh giá | ✓ | ✓ | ✓ |
| 91 | Review | REVIEW_LIST | Xem danh sách đánh giá | ✓ | ✓ | ✓ |
| 92 | Review | REVIEW_UPDATE | Cập nhật đánh giá | ✓ | ✗ | ✓* |
| 93 | Review | REVIEW_DELETE | Xóa đánh giá | ✓ | ✓ | ✓* |
| 94 | Review | REVIEW_LIST_BY_MOVIE | Xem đánh giá theo phim | ✓ | ✓ | ✓ |
| **GENRE MANAGEMENT** |
| 95 | Genre | GENRE_CREATE | Tạo thể loại mới | ✓ | ✓ | ✗ |
| 96 | Genre | GENRE_READ | Xem thông tin thể loại | ✓ | ✓ | ✓ |
| 97 | Genre | GENRE_LIST | Xem danh sách thể loại | ✓ | ✓ | ✓ |
| 98 | Genre | GENRE_UPDATE | Cập nhật thể loại | ✓ | ✓ | ✗ |
| 99 | Genre | GENRE_DELETE | Xóa thể loại | ✓ | ✗ | ✗ |
| **PROMOTION MANAGEMENT** |
| 100 | Promotion | PROMOTION_CREATE | Tạo khuyến mãi mới | ✓ | ✓ | ✗ |
| 101 | Promotion | PROMOTION_READ | Xem thông tin khuyến mãi | ✓ | ✓ | ✓ |
| 102 | Promotion | PROMOTION_LIST | Xem danh sách khuyến mãi | ✓ | ✓ | ✓ |
| 103 | Promotion | PROMOTION_UPDATE | Cập nhật khuyến mãi | ✓ | ✓ | ✗ |
| 104 | Promotion | PROMOTION_DELETE | Xóa khuyến mãi | ✓ | ✗ | ✗ |
| 105 | Promotion | PROMOTION_ACTIVATE | Kích hoạt khuyến mãi | ✓ | ✓ | ✗ |
| 106 | Promotion | PROMOTION_DEACTIVATE | Vô hiệu hóa khuyến mãi | ✓ | ✓ | ✗ |
| **REGION MANAGEMENT** |
| 107 | Region | REGION_CREATE | Tạo khu vực mới | ✓ | ✗ | ✗ |
| 108 | Region | REGION_READ | Xem thông tin khu vực | ✓ | ✓ | ✓ |
| 109 | Region | REGION_LIST | Xem danh sách khu vực | ✓ | ✓ | ✓ |
| 110 | Region | REGION_UPDATE | Cập nhật khu vực | ✓ | ✗ | ✗ |
| 111 | Region | REGION_DELETE | Xóa khu vực | ✓ | ✗ | ✗ |
| **REVENUE MANAGEMENT** |
| 112 | Revenue | REVENUE_VIEW | Xem báo cáo doanh thu | ✓ | ✓ | ✗ |
| 113 | Revenue | REVENUE_VIEW_BY_CINEMA | Xem doanh thu theo rạp | ✓ | ✓ | ✗ |
| 114 | Revenue | REVENUE_VIEW_BY_MOVIE | Xem doanh thu theo phim | ✓ | ✗ | ✗ |
| 115 | Revenue | REVENUE_VIEW_STATISTICS | Xem thống kê doanh thu | ✓ | ✗ | ✗ |
| **CACHE MANAGEMENT** |
| 116 | Cache | CACHE_CLEAR_ALL | Xóa toàn bộ cache | ✓ | ✗ | ✗ |
| 117 | Cache | CACHE_CLEAR_SPECIFIC | Xóa cache cụ thể | ✓ | ✗ | ✗ |
| 118 | Cache | CACHE_VIEW | Xem thông tin cache | ✓ | ✗ | ✗ |
| **EMAIL MANAGEMENT** |
| 119 | Email | EMAIL_SEND | Gửi email | ✓ | ✗ | ✗ |
| 120 | Email | EMAIL_SEND_BOOKING | Gửi email xác nhận đặt vé | ✓ | ✓ | ✗ |

**Ghi chú**: 
- ✓ = Có quyền
- ✗ = Không có quyền
- ✓* = Chỉ có quyền với dữ liệu của chính mình (own data)

---

## THỐNG KÊ PERMISSIONS THEO ROLE

### ADMIN
- **Tổng**: 120/120 permissions (100%)
- **Mô tả**: Toàn quyền quản trị hệ thống

### STAFF
- **Tổng**: ~55/120 permissions (46%)
- **Mô tả**: Quản lý vận hành rạp, phim, lịch chiếu, đặt vé
- **Nhóm chính**: 
  - Movie Management: 5/9
  - Cinema Management: 4/7
  - Theater Management: 5/7
  - Seat Management: 5/8
  - Showtime Management: 10/13
  - Booking Management: 7/11
  - Payment Management: 2/6
  - Review Management: 3/6
  - Genre Management: 4/5
  - Promotion Management: 5/7
  - Revenue Management: 2/4

### USER
- **Tổng**: ~40/120 permissions (33%)
- **Mô tả**: Xem thông tin, đặt vé, quản lý tài khoản cá nhân
- **Nhóm chính**:
  - User Management (self): 4/13
  - Movie Management (view): 7/9
  - Cinema Management (view): 4/7
  - Theater Management (view): 3/7
  - Seat Management (view): 3/8
  - Showtime Management (view): 6/13
  - Booking Management (self): 4/11
  - Review Management: 5/6
  - Genre Management (view): 2/5
  - Promotion Management (view): 2/7
  - Region Management (view): 2/5

---

## THỐNG KÊ THEO MODULE

| Module | Số Permissions | % Tổng |
|--------|----------------|--------|
| User Management | 13 | 10.8% |
| Showtime Management | 13 | 10.8% |
| Booking Management | 11 | 9.2% |
| Role Management | 9 | 7.5% |
| Movie Management | 9 | 7.5% |
| Seat Management | 8 | 6.7% |
| Cinema Management | 7 | 5.8% |
| Theater Management | 7 | 5.8% |
| Promotion Management | 7 | 5.8% |
| Payment Management | 6 | 5.0% |
| Review Management | 6 | 5.0% |
| Permission Management | 5 | 4.2% |
| Genre Management | 5 | 4.2% |
| Region Management | 5 | 4.2% |
| Revenue Management | 4 | 3.3% |
| Cache Management | 3 | 2.5% |
| Email Management | 2 | 1.7% |
| **TỔNG** | **120** | **100%** |

---

## KHUYẾN NGHỊ TRIỂN KHAI

### Phase 1: Khởi tạo dữ liệu
1. Tạo 120 permissions trong database
2. Tạo 3 roles: Admin, Staff, User
3. Gán permissions cho từng role

### Phase 2: Áp dụng security
1. Thêm @PreAuthorize annotation vào controllers
2. Cập nhật SecurityConfig
3. Test từng endpoint với từng role

### Phase 3: Fine-tuning
1. Điều chỉnh permissions theo feedback
2. Thêm custom permissions nếu cần
3. Implement row-level security (user chỉ xem được data của mình)

---

**Ngày tạo**: 29/12/2025  
**Người phân tích**: GitHub Copilot  
**Version**: 1.0

