# HotCinema Frontend Mock Data Mode

Mock mode cho phép chạy và kiểm thử giao diện HotCinema khi Backend chưa hoàn thiện. Mock được cài ở API adapter nên page/service vẫn gọi đúng contract hiện tại (`movieService`, `bookingService`, `paymentService`, ...), không cần hard-code dữ liệu trong component.

## Chạy nhanh

```bash
cd Frontend
npm install
npm run dev
```

Với cấu hình mẫu:

```env
VITE_USE_MOCK_DATA=auto
```

- `auto`: Vite development dùng mock, production build dùng API thật.
- `true`: ép bật mock ở mọi mode.
- `false`: ép dùng Backend thật ở mọi mode.

Nếu biến này bị bỏ hoàn toàn, development cũng mặc định bật mock còn production mặc định dùng API thật.

## Tài khoản test

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@hotcinema.vn` | `admin123` |
| Customer | `customer@hotcinema.vn` | `customer123` |
| Staff | `staff@hotcinema.vn` | `staff123` |

## Promotion test

- `HOT20`: giảm 20%, còn hiệu lực.
- `WELCOME50`: giảm cố định 50.000đ, còn hiệu lực.
- `OLD10`: promotion hết hạn/inactive để test trạng thái lỗi.

## Dữ liệu hiện có

Mock database bao phủ các flow giao diện chính:

- Auth/login và protected routes.
- Movies: list, now showing, coming soon, search, detail, genre selector và CRUD.
- Cinemas, rooms và seat layout.
- Showtimes theo ngày/phim/rạp, bao gồm response group `movie -> formats -> showtimes` cho Schedule/CinemaDetail.
- Seat lock/unlock giả lập và trạng thái booked/maintenance/VIP/couple.
- Admin Seat Manager: tạo phòng mới, tạo sơ đồ mặc định, thêm/sửa/xóa ghế và hàng ghế.
- Booking creation, promotion calculation và booking history/detail.
- Payment mock trả `SUCCESS` trực tiếp để test Booking Success mà không redirect sang MoMo/VNPay thật.
- Admin Payment được enrich `paymentStatus`, khách hàng và thời gian giao dịch để test bảng/detail.
- Users, staff, activate/deactivate và CRUD.
- Promotions CRUD/activate/deactivate.
- Concessions/Food & Beverage CRUD.
- Reviews/comments và moderation approve/reject.
- Notifications, mark read, read all, delete và admin broadcast.
- Roles/permissions và permission assignment.
- Settings.
- Revenue summary, daily revenue, top movies/cinemas và Admin Dashboard.
- Ticket download trả mock Blob để test thao tác tải file.
- Avatar/media upload trả local data URL khi mock, không cần Cloudinary key.
- Seat WebSocket được giả lập ở trạng thái connected để không cần `ws-booking` khi Backend chưa chạy.

## Dữ liệu có lưu lại không?

Có. Các thao tác mock CRUD được lưu trong:

```text
localStorage: hotcinema_mock_database_v1
```

Toolbar `Frontend test mode` ở góc trái phía dưới có nút **Reset dữ liệu** để quay lại seed ban đầu.

## Chuyển sang Backend thật

Có 3 cách.

### 1. Toolbar development

Nhấn **Dùng API thật**. Trang sẽ reload và xóa session đăng nhập mock.

### 2. Environment

```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_BOOKING_WS_URL=http://localhost:8080/ws-booking
```

### 3. Ép bật mock

```env
VITE_USE_MOCK_DATA=true
VITE_MOCK_API_DELAY=280
```

`VITE_MOCK_API_DELAY` tạo độ trễ giả để có thể kiểm tra skeleton/loading state. Giá trị `0` sẽ trả dữ liệu gần như ngay lập tức.

## Quy tắc kiến trúc

Không đưa dữ liệu mock trực tiếp vào page/component. Nếu cần thêm case test, ưu tiên sửa:

- `src/mocks/mockDatabase.js`: seed/domain data.
- `src/mocks/mockApiAdapter.js`: API behavior chung.
- `src/mocks/bootstrapMockApi.js`: các compatibility override cần đúng với service/page đang active.
- `src/mocks/mockConfig.js`: mode/configuration.

Mục tiêu là khi Backend hoàn thiện, chỉ cần tắt mock mode; UI và service không phải viết lại.
