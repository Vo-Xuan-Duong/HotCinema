# PHÂN TÍCH PERMISSION HỆ THỐNG HOTCINEMAS

## Tổng quan
Hệ thống HotCinemas sử dụng mô hình quản lý quyền (Permission-Based Access Control) với các thành phần chính:
- **Permission**: Quyền cụ thể cho từng hành động
- **Role**: Vai trò người dùng (Admin, User, Staff)
- **RolePermission**: Bảng trung gian mapping giữa Role và Permission

## Cấu trúc Permission
- Tên permission (name): Định danh duy nhất
- Mô tả (description): Mô tả chức năng
- Module: Nhóm chức năng (User, Movie, Cinema, Booking, etc.)

---

## DANH SÁCH PERMISSION THEO MODULE

### 1. MODULE: USER MANAGEMENT
**Mục đích**: Quản lý người dùng trong hệ thống

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 1 | USER_CREATE | Tạo người dùng mới | POST | /api/v1/users |
| 2 | USER_READ | Xem thông tin người dùng | GET | /api/v1/users/{id} |
| 3 | USER_LIST | Xem danh sách người dùng | GET | /api/v1/users |
| 4 | USER_UPDATE | Cập nhật thông tin người dùng | PUT | /api/v1/users/{id} |
| 5 | USER_DELETE | Xóa người dùng | DELETE | /api/v1/users/{id} |
| 6 | USER_CHANGE_PASSWORD | Đổi mật khẩu người dùng | PUT | /api/v1/users/{id}/password |
| 7 | USER_CHANGE_AVATAR | Đổi ảnh đại diện | PUT | /api/v1/users/{id}/avatar |
| 8 | USER_CHANGE_ROLE | Thay đổi vai trò người dùng | POST | /api/v1/users/{id}/change-roles |
| 9 | USER_ACTIVATE | Kích hoạt tài khoản | PUT | /api/v1/users/{id}/activate |
| 10 | USER_DEACTIVATE | Vô hiệu hóa tài khoản | PUT | /api/v1/users/{id}/deactivate |
| 11 | USER_SEARCH | Tìm kiếm người dùng | GET | /api/v1/users/search |
| 12 | USER_PROFILE_VIEW | Xem profile cá nhân | GET | /api/v1/users/profile |
| 13 | USER_PROFILE_UPDATE | Cập nhật profile cá nhân | PUT | /api/v1/users/profile |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: USER_READ, USER_LIST, USER_SEARCH
- User: USER_PROFILE_VIEW, USER_PROFILE_UPDATE, USER_CHANGE_PASSWORD, USER_CHANGE_AVATAR

---

### 2. MODULE: ROLE MANAGEMENT
**Mục đích**: Quản lý vai trò và phân quyền

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 14 | ROLE_CREATE | Tạo vai trò mới | POST | /api/v1/roles |
| 15 | ROLE_READ | Xem thông tin vai trò | GET | /api/v1/roles/{id} |
| 16 | ROLE_LIST | Xem danh sách vai trò | GET | /api/v1/roles |
| 17 | ROLE_UPDATE | Cập nhật vai trò | PUT | /api/v1/roles/{id} |
| 18 | ROLE_DELETE | Xóa vai trò | DELETE | /api/v1/roles/{id} |
| 19 | ROLE_ACTIVATE | Kích hoạt vai trò | POST | /api/v1/roles/{id}/activate |
| 20 | ROLE_DEACTIVATE | Vô hiệu hóa vai trò | POST | /api/v1/roles/{id}/deactivate |
| 21 | ROLE_ADD_PERMISSION | Thêm quyền vào vai trò | POST | /api/v1/roles/{id}/permissions |
| 22 | ROLE_REMOVE_PERMISSION | Xóa quyền khỏi vai trò | DELETE | /api/v1/roles/{id}/permissions |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: Không có
- User: Không có

---

### 3. MODULE: PERMISSION MANAGEMENT
**Mục đích**: Quản lý các quyền trong hệ thống

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 23 | PERMISSION_CREATE | Tạo quyền mới | POST | /api/v1/permissions |
| 24 | PERMISSION_READ | Xem thông tin quyền | GET | /api/v1/permissions/{id} |
| 25 | PERMISSION_LIST | Xem danh sách quyền | GET | /api/v1/permissions |
| 26 | PERMISSION_UPDATE | Cập nhật quyền | PUT | /api/v1/permissions/{id} |
| 27 | PERMISSION_DELETE | Xóa quyền | DELETE | /api/v1/permissions/{id} |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: PERMISSION_READ, PERMISSION_LIST
- User: Không có

---

### 4. MODULE: MOVIE MANAGEMENT
**Mục đích**: Quản lý phim trong rạp

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 28 | MOVIE_CREATE | Tạo phim mới | POST | /api/v1/movies |
| 29 | MOVIE_READ | Xem thông tin phim | GET | /api/v1/movies/{id} |
| 30 | MOVIE_LIST | Xem danh sách phim | GET | /api/v1/movies |
| 31 | MOVIE_UPDATE | Cập nhật thông tin phim | PUT | /api/v1/movies/{id} |
| 32 | MOVIE_DELETE | Xóa phim | DELETE | /api/v1/movies/{id} |
| 33 | MOVIE_SEARCH | Tìm kiếm phim | GET | /api/v1/movies/search |
| 34 | MOVIE_VIEW_COMING_SOON | Xem phim sắp chiếu | GET | /api/v1/movies/coming-soon |
| 35 | MOVIE_VIEW_NOW_SHOWING | Xem phim đang chiếu | GET | /api/v1/movies/now-showing |
| 36 | MOVIE_VIEW_TOP_RATED | Xem phim đánh giá cao | GET | /api/v1/movies/top-rated |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: MOVIE_CREATE, MOVIE_UPDATE, MOVIE_READ, MOVIE_LIST, MOVIE_SEARCH
- User: MOVIE_READ, MOVIE_LIST, MOVIE_SEARCH, MOVIE_VIEW_* (public)

---

### 5. MODULE: CINEMA MANAGEMENT
**Mục đích**: Quản lý rạp chiếu phim

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 37 | CINEMA_CREATE | Tạo rạp mới | POST | /api/v1/cinemas |
| 38 | CINEMA_READ | Xem thông tin rạp | GET | /api/v1/cinemas/{id} |
| 39 | CINEMA_LIST | Xem danh sách rạp | GET | /api/v1/cinemas |
| 40 | CINEMA_UPDATE | Cập nhật thông tin rạp | PUT | /api/v1/cinemas/{id} |
| 41 | CINEMA_DELETE | Xóa rạp | DELETE | /api/v1/cinemas/{id} |
| 42 | CINEMA_SEARCH_BY_REGION | Tìm rạp theo khu vực | GET | /api/v1/cinemas/region/{slug} |
| 43 | CINEMA_SEARCH_BY_MOVIE | Tìm rạp chiếu phim | GET | /api/v1/cinemas/movie/{movieId} |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: CINEMA_READ, CINEMA_LIST, CINEMA_SEARCH_*
- User: CINEMA_READ, CINEMA_LIST, CINEMA_SEARCH_* (public)

---

### 6. MODULE: THEATER MANAGEMENT
**Mục đích**: Quản lý phòng chiếu trong rạp

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 44 | THEATER_CREATE | Tạo phòng chiếu mới | POST | /api/v1/theaters/cinema/{cinemaId} |
| 45 | THEATER_READ | Xem thông tin phòng chiếu | GET | /api/v1/theaters/{id} |
| 46 | THEATER_LIST | Xem danh sách phòng chiếu | GET | /api/v1/theaters |
| 47 | THEATER_UPDATE | Cập nhật phòng chiếu | PUT | /api/v1/theaters/{id} |
| 48 | THEATER_DELETE | Xóa phòng chiếu | DELETE | /api/v1/theaters/{id} |
| 49 | THEATER_DELETE_BY_CINEMA | Xóa tất cả phòng chiếu của rạp | DELETE | /api/v1/theaters/cinema/{cinemaId} |
| 50 | THEATER_LIST_BY_CINEMA | Xem phòng chiếu theo rạp | GET | /api/v1/theaters/cinema/{cinemaId} |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: THEATER_CREATE, THEATER_UPDATE, THEATER_READ, THEATER_LIST, THEATER_LIST_BY_CINEMA
- User: THEATER_READ, THEATER_LIST, THEATER_LIST_BY_CINEMA (public)

---

### 7. MODULE: SEAT MANAGEMENT
**Mục đích**: Quản lý ghế ngồi trong phòng chiếu

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 51 | SEAT_CREATE | Tạo ghế mới | POST | /api/v1/seats |
| 52 | SEAT_READ | Xem thông tin ghế | GET | /api/v1/seats/{id} |
| 53 | SEAT_LIST | Xem danh sách ghế | GET | /api/v1/seats |
| 54 | SEAT_UPDATE | Cập nhật thông tin ghế | PUT | /api/v1/seats/{id} |
| 55 | SEAT_DELETE | Xóa ghế | DELETE | /api/v1/seats/{id} |
| 56 | SEAT_CREATE_BULK | Tạo hàng loạt ghế | POST | /api/v1/seats/theater/{theaterId}/create-bulk |
| 57 | SEAT_DELETE_BY_THEATER | Xóa tất cả ghế của phòng chiếu | DELETE | /api/v1/seats/theater/{theaterId} |
| 58 | SEAT_LIST_BY_THEATER | Xem ghế theo phòng chiếu | GET | /api/v1/seats/theater/{theaterId} |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: SEAT_CREATE, SEAT_UPDATE, SEAT_CREATE_BULK, SEAT_READ, SEAT_LIST
- User: SEAT_READ, SEAT_LIST, SEAT_LIST_BY_THEATER (public)

---

### 8. MODULE: SHOWTIME MANAGEMENT
**Mục đích**: Quản lý lịch chiếu phim

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 59 | SHOWTIME_CREATE | Tạo lịch chiếu mới | POST | /api/v1/showtime |
| 60 | SHOWTIME_READ | Xem thông tin lịch chiếu | GET | /api/v1/showtime/{id} |
| 61 | SHOWTIME_LIST | Xem danh sách lịch chiếu | GET | /api/v1/showtime |
| 62 | SHOWTIME_UPDATE | Cập nhật lịch chiếu | PUT | /api/v1/showtime/{id} |
| 63 | SHOWTIME_DELETE | Xóa lịch chiếu | DELETE | /api/v1/showtime/{id} |
| 64 | SHOWTIME_UPDATE_STATUS | Cập nhật trạng thái lịch chiếu | PUT | /api/v1/showtime/{id}/status |
| 65 | SHOWTIME_DELETE_BY_MOVIE | Xóa lịch chiếu theo phim | DELETE | /api/v1/showtime/movie/{movieId} |
| 66 | SHOWTIME_DELETE_BY_THEATER | Xóa lịch chiếu theo phòng chiếu | DELETE | /api/v1/showtime/theater/{theaterId} |
| 67 | SHOWTIME_LOCK_SEAT | Khóa ghế trong lịch chiếu | POST | /api/v1/showtime/{showtimeId}/lock-seat/{seatId} |
| 68 | SHOWTIME_UNLOCK_SEAT | Mở khóa ghế trong lịch chiếu | POST | /api/v1/showtime/{showtimeId}/unlock-seat/{seatId} |
| 69 | SHOWTIME_SEARCH | Tìm kiếm lịch chiếu | GET | /api/v1/showtime/search |
| 70 | SHOWTIME_BY_MOVIE | Xem lịch chiếu theo phim | GET | /api/v1/showtime/movie/{movieId} |
| 71 | SHOWTIME_BY_THEATER | Xem lịch chiếu theo phòng chiếu | GET | /api/v1/showtime/theater/{theaterId} |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: SHOWTIME_CREATE, SHOWTIME_UPDATE, SHOWTIME_DELETE, SHOWTIME_UPDATE_STATUS, SHOWTIME_LOCK_SEAT, SHOWTIME_UNLOCK_SEAT
- User: SHOWTIME_READ, SHOWTIME_LIST, SHOWTIME_SEARCH, SHOWTIME_BY_* (public)

---

### 9. MODULE: BOOKING MANAGEMENT
**Mục đích**: Quản lý đặt vé

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 72 | BOOKING_CREATE | Tạo đơn đặt vé | POST | /api/v1/bookings |
| 73 | BOOKING_READ | Xem thông tin đặt vé | GET | /api/v1/bookings/{id} |
| 74 | BOOKING_LIST | Xem danh sách đặt vé | GET | /api/v1/bookings |
| 75 | BOOKING_UPDATE | Cập nhật đặt vé | PUT | /api/v1/bookings/{id} |
| 76 | BOOKING_DELETE | Hủy đặt vé | DELETE | /api/v1/bookings/{id} |
| 77 | BOOKING_UPDATE_STATUS | Cập nhật trạng thái đặt vé | PUT | /api/v1/bookings/{id}/status |
| 78 | BOOKING_CONFIRM | Xác nhận đặt vé | POST | /api/v1/bookings/{id}/confirm |
| 79 | BOOKING_CANCEL | Hủy đặt vé | POST | /api/v1/bookings/{id}/cancel |
| 80 | BOOKING_LIST_BY_USER | Xem đặt vé của người dùng | GET | /api/v1/bookings/user/{userId} |
| 81 | BOOKING_LIST_BY_SHOWTIME | Xem đặt vé theo lịch chiếu | GET | /api/v1/bookings/showtime/{showtimeId} |
| 82 | BOOKING_MY_BOOKINGS | Xem đơn đặt vé của tôi | GET | /api/v1/bookings/my-bookings |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: BOOKING_READ, BOOKING_LIST, BOOKING_UPDATE_STATUS, BOOKING_CONFIRM, BOOKING_CANCEL
- User: BOOKING_CREATE, BOOKING_READ (own), BOOKING_MY_BOOKINGS, BOOKING_CANCEL (own)

---

### 10. MODULE: PAYMENT MANAGEMENT
**Mục đích**: Quản lý thanh toán

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 83 | PAYMENT_CREATE | Tạo giao dịch thanh toán | POST | /api/v1/payments |
| 84 | PAYMENT_READ | Xem thông tin thanh toán | GET | /api/v1/payments/{id} |
| 85 | PAYMENT_LIST | Xem danh sách thanh toán | GET | /api/v1/payments |
| 86 | PAYMENT_UPDATE | Cập nhật thanh toán | PUT | /api/v1/payments/{id} |
| 87 | PAYMENT_DELETE | Xóa giao dịch thanh toán | DELETE | /api/v1/payments/{id} |
| 88 | PAYMENT_CALLBACK | Xử lý callback thanh toán | POST | /api/v1/payments/momo-callback |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: PAYMENT_READ, PAYMENT_LIST
- User: PAYMENT_CREATE (own), PAYMENT_READ (own)

---

### 11. MODULE: REVIEW MANAGEMENT
**Mục đích**: Quản lý đánh giá phim

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 89 | REVIEW_CREATE | Tạo đánh giá mới | POST | /api/v1/reviews |
| 90 | REVIEW_READ | Xem đánh giá | GET | /api/v1/reviews/{id} |
| 91 | REVIEW_LIST | Xem danh sách đánh giá | GET | /api/v1/reviews |
| 92 | REVIEW_UPDATE | Cập nhật đánh giá | PUT | /api/v1/reviews/{reviewId} |
| 93 | REVIEW_DELETE | Xóa đánh giá | DELETE | /api/v1/reviews/{reviewId} |
| 94 | REVIEW_LIST_BY_MOVIE | Xem đánh giá theo phim | GET | /api/v1/reviews/movie/{movieId} |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: REVIEW_READ, REVIEW_LIST, REVIEW_DELETE
- User: REVIEW_CREATE, REVIEW_UPDATE (own), REVIEW_DELETE (own), REVIEW_READ, REVIEW_LIST

---

### 12. MODULE: GENRE MANAGEMENT
**Mục đích**: Quản lý thể loại phim

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 95 | GENRE_CREATE | Tạo thể loại mới | POST | /api/v1/genres |
| 96 | GENRE_READ | Xem thông tin thể loại | GET | /api/v1/genres/{id} |
| 97 | GENRE_LIST | Xem danh sách thể loại | GET | /api/v1/genres |
| 98 | GENRE_UPDATE | Cập nhật thể loại | PUT | /api/v1/genres/{id} |
| 99 | GENRE_DELETE | Xóa thể loại | DELETE | /api/v1/genres/{id} |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: GENRE_CREATE, GENRE_UPDATE, GENRE_READ, GENRE_LIST
- User: GENRE_READ, GENRE_LIST (public)

---

### 13. MODULE: PROMOTION MANAGEMENT
**Mục đích**: Quản lý khuyến mãi

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 100 | PROMOTION_CREATE | Tạo khuyến mãi mới | POST | /api/v1/promotions |
| 101 | PROMOTION_READ | Xem thông tin khuyến mãi | GET | /api/v1/promotions/{id} |
| 102 | PROMOTION_LIST | Xem danh sách khuyến mãi | GET | /api/v1/promotions |
| 103 | PROMOTION_UPDATE | Cập nhật khuyến mãi | PUT | /api/v1/promotions/{id} |
| 104 | PROMOTION_DELETE | Xóa khuyến mãi | DELETE | /api/v1/promotions/{id} |
| 105 | PROMOTION_ACTIVATE | Kích hoạt khuyến mãi | POST | /api/v1/promotions/{id}/activate |
| 106 | PROMOTION_DEACTIVATE | Vô hiệu hóa khuyến mãi | POST | /api/v1/promotions/{id}/deactivate |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: PROMOTION_CREATE, PROMOTION_UPDATE, PROMOTION_ACTIVATE, PROMOTION_DEACTIVATE
- User: PROMOTION_READ, PROMOTION_LIST (public)

---

### 14. MODULE: REGION MANAGEMENT
**Mục đích**: Quản lý khu vực địa lý

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 107 | REGION_CREATE | Tạo khu vực mới | POST | /api/v1/regions |
| 108 | REGION_READ | Xem thông tin khu vực | GET | /api/v1/regions/{slug} |
| 109 | REGION_LIST | Xem danh sách khu vực | GET | /api/v1/regions |
| 110 | REGION_UPDATE | Cập nhật khu vực | PUT | /api/v1/regions/{slug} |
| 111 | REGION_DELETE | Xóa khu vực | DELETE | /api/v1/regions/{slug} |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: REGION_READ, REGION_LIST
- User: REGION_READ, REGION_LIST (public)

---

### 15. MODULE: REVENUE MANAGEMENT
**Mục đích**: Quản lý doanh thu và báo cáo

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 112 | REVENUE_VIEW | Xem báo cáo doanh thu | GET | /api/v1/revenue |
| 113 | REVENUE_VIEW_BY_CINEMA | Xem doanh thu theo rạp | GET | /api/v1/revenue/cinema/{cinemaId} |
| 114 | REVENUE_VIEW_BY_MOVIE | Xem doanh thu theo phim | GET | /api/v1/revenue/movie/{movieId} |
| 115 | REVENUE_VIEW_STATISTICS | Xem thống kê doanh thu | GET | /api/v1/revenue/statistics |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: REVENUE_VIEW, REVENUE_VIEW_BY_CINEMA
- User: Không có

---

### 16. MODULE: CACHE MANAGEMENT
**Mục đích**: Quản lý bộ nhớ đệm hệ thống

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 116 | CACHE_CLEAR_ALL | Xóa toàn bộ cache | DELETE | /api/v1/cache/clear-all |
| 117 | CACHE_CLEAR_SPECIFIC | Xóa cache cụ thể | DELETE | /api/v1/cache/clear/{cacheName} |
| 118 | CACHE_VIEW | Xem thông tin cache | GET | /api/v1/cache |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: Không có
- User: Không có

---

### 17. MODULE: EMAIL MANAGEMENT
**Mục đích**: Quản lý gửi email

| STT | Permission Name | Mô tả | HTTP Method | Endpoint |
|-----|-----------------|-------|-------------|----------|
| 119 | EMAIL_SEND | Gửi email | POST | /api/v1/email/send |
| 120 | EMAIL_SEND_BOOKING | Gửi email xác nhận đặt vé | POST | /api/v1/email/booking |

**Phân quyền gợi ý**:
- Admin: Tất cả permissions
- Staff: EMAIL_SEND_BOOKING
- User: Không có (system only)

---

## TỔNG KẾT

### Thống kê theo Module:
1. User Management: 13 permissions
2. Role Management: 9 permissions
3. Permission Management: 5 permissions
4. Movie Management: 9 permissions
5. Cinema Management: 7 permissions
6. Theater Management: 7 permissions
7. Seat Management: 8 permissions
8. Showtime Management: 13 permissions
9. Booking Management: 11 permissions
10. Payment Management: 6 permissions
11. Review Management: 6 permissions
12. Genre Management: 5 permissions
13. Promotion Management: 7 permissions
14. Region Management: 5 permissions
15. Revenue Management: 4 permissions
16. Cache Management: 3 permissions
17. Email Management: 2 permissions

**TỔNG CỘNG: 120 PERMISSIONS**

---

## GỢI Ý PHÂN QUYỀN CHO CÁC ROLE

### ADMIN (Quản trị viên)
- Có toàn quyền trên hệ thống
- Tất cả 120 permissions

### STAFF (Nhân viên)
- Quản lý phim, rạp, lịch chiếu, đặt vé
- Khoảng 50-60 permissions liên quan đến vận hành

**Danh sách permissions cho Staff:**
- User: USER_READ, USER_LIST, USER_SEARCH
- Movie: MOVIE_CREATE, MOVIE_UPDATE, MOVIE_READ, MOVIE_LIST, MOVIE_SEARCH
- Cinema: CINEMA_READ, CINEMA_LIST, CINEMA_SEARCH_*
- Theater: THEATER_CREATE, THEATER_UPDATE, THEATER_READ, THEATER_LIST, THEATER_LIST_BY_CINEMA
- Seat: SEAT_CREATE, SEAT_UPDATE, SEAT_CREATE_BULK, SEAT_READ, SEAT_LIST
- Showtime: SHOWTIME_CREATE, SHOWTIME_UPDATE, SHOWTIME_DELETE, SHOWTIME_UPDATE_STATUS, SHOWTIME_LOCK_SEAT, SHOWTIME_UNLOCK_SEAT
- Booking: BOOKING_READ, BOOKING_LIST, BOOKING_UPDATE_STATUS, BOOKING_CONFIRM, BOOKING_CANCEL
- Payment: PAYMENT_READ, PAYMENT_LIST
- Review: REVIEW_READ, REVIEW_LIST, REVIEW_DELETE
- Genre: GENRE_CREATE, GENRE_UPDATE, GENRE_READ, GENRE_LIST
- Promotion: PROMOTION_CREATE, PROMOTION_UPDATE, PROMOTION_ACTIVATE, PROMOTION_DEACTIVATE
- Region: REGION_READ, REGION_LIST
- Revenue: REVENUE_VIEW, REVENUE_VIEW_BY_CINEMA
- Email: EMAIL_SEND_BOOKING

### USER (Khách hàng)
- Xem thông tin công khai, đặt vé, quản lý tài khoản cá nhân
- Khoảng 30-40 permissions

**Danh sách permissions cho User:**
- User: USER_PROFILE_VIEW, USER_PROFILE_UPDATE, USER_CHANGE_PASSWORD, USER_CHANGE_AVATAR
- Movie: MOVIE_READ, MOVIE_LIST, MOVIE_SEARCH, MOVIE_VIEW_*
- Cinema: CINEMA_READ, CINEMA_LIST, CINEMA_SEARCH_*
- Theater: THEATER_READ, THEATER_LIST, THEATER_LIST_BY_CINEMA
- Seat: SEAT_READ, SEAT_LIST, SEAT_LIST_BY_THEATER
- Showtime: SHOWTIME_READ, SHOWTIME_LIST, SHOWTIME_SEARCH, SHOWTIME_BY_*
- Booking: BOOKING_CREATE, BOOKING_MY_BOOKINGS, BOOKING_CANCEL (own)
- Payment: PAYMENT_CREATE (own), PAYMENT_READ (own)
- Review: REVIEW_CREATE, REVIEW_UPDATE (own), REVIEW_DELETE (own), REVIEW_READ, REVIEW_LIST
- Genre: GENRE_READ, GENRE_LIST
- Promotion: PROMOTION_READ, PROMOTION_LIST
- Region: REGION_READ, REGION_LIST

---

## HIỆN TRẠNG HỆ THỐNG

### Đã implement:
- ✅ Model Permission, Role, RolePermission
- ✅ Repository cho Permission, Role, RolePermission
- ✅ Service và Controller cho quản lý Permission
- ✅ Service và Controller cho quản lý Role
- ✅ Mapper cho Permission và Role
- ✅ UserDetailsService tích hợp permissions vào authorities

### Chưa implement:
- ❌ Dữ liệu permission trong database (chưa có script khởi tạo)
- ❌ Security annotation (@PreAuthorize) trên các endpoint
- ❌ Phân quyền cụ thể trong SecurityConfig (hiện tại permitAll)
- ❌ Script SQL để insert 120 permissions vào database
- ❌ Script để gán permissions cho các role mặc định

---

## KHUYẾN NGHỊ

### Bước 1: Tạo script khởi tạo permissions
Tạo file SQL hoặc code trong AppInitConfig để insert 120 permissions vào database.

### Bước 2: Gán permissions cho roles
- Admin: Tất cả 120 permissions
- Staff: ~50-60 permissions
- User: ~30-40 permissions

### Bước 3: Áp dụng security
- Thêm @PreAuthorize vào các controller methods
- Cập nhật SecurityConfig để kiểm tra permissions
- Chỉ cho phép public endpoints không cần authentication

### Bước 4: Testing
- Test từng role với các permissions
- Đảm bảo user không thể truy cập vào các endpoint không có quyền

---

## LƯU Ý
- Permissions này được phân tích dựa trên cấu trúc controller hiện tại
- Có thể cần điều chỉnh khi có thêm tính năng mới
- Nên có thêm permissions cho các action đặc biệt (approve, reject, export, import, etc.)
- Cân nhắc thêm permission cho WebSocket nếu có tính năng realtime

