# 🎬 HotCinema

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-25-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vite.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1.svg)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io/)

HotCinema là hệ thống đặt vé và quản lý rạp chiếu phim full-stack gồm **Spring Boot backend**, **React frontend**, **MySQL**, **Redis**, WebSocket và tích hợp thanh toán **MoMo**.

Dự án đã vượt qua giai đoạn CRUD cơ bản và hiện có các business flow chính như giữ ghế, checkout server-authoritative, combo/F&B, promotion, thanh toán, phát hành ticket, QR check-in, lịch sử booking, hủy booking chưa thanh toán và refund booking đã thanh toán.

> **Trạng thái:** đang tiếp tục hardening để đạt mức production-ready. Core booking flow đã hoạt động ở mức kiến trúc/source code; các phần cần đầu tư tiếp chủ yếu là payment edge cases, refund policy, API contract audit, automated/integration/E2E testing, observability và production deployment.

---

## 📌 Trạng thái hệ thống hiện tại

| Khu vực | Trạng thái | Ghi chú |
|---|---|---|
| Domain / Entity model | ✅ | Movie, Cinema, Auditorium, Seat, Showtime, Booking, Payment, Ticket, Promotion, Product... |
| Authentication / JWT | ✅ | Login, token, refresh flow, role-based security và protected APIs đã có |
| Catalog | ✅ | Movie, cinema, auditorium, showtime và dữ liệu liên quan |
| Seat hold | ✅ | Ghế có trạng thái `AVAILABLE → HELD → BOOKED`, có timeout/release |
| Seat concurrency | ✅ Core | Có pessimistic locking và kiểm tra ownership/expiry |
| WebSocket seat update | ✅ | Broadcast thay đổi trạng thái ghế realtime |
| Booking checkout | ✅ | Backend tự xác thực ghế, tính tiền và tạo booking |
| F&B / Concession | ✅ Core | Chọn combo, kiểm tồn kho, trừ/hoàn tồn khi checkout/cancel/expire/refund |
| Promotion | ✅ Core | Validate thời gian, usage, minimum order và reservation |
| Booking history | ✅ | MEMBER lấy booking của chính mình |
| Booking cancellation | ✅ | Hủy booking chưa thanh toán, release seat/F&B/promotion |
| MoMo payment | ✅ Core | Initiate, redirect, IPN/callback và finalize booking |
| Ticket issuance | ✅ | Ticket phát hành sau payment success |
| QR ticket | ✅ | FE tạo QR từ token backend; scanner validate ticket |
| Refund | ✅ Core | Refund booking đã thanh toán và release tài nguyên |
| Admin CRUD | ✅ Core | Các module quản trị chính đã có nền tảng |
| Flyway | ✅ | `ddl-auto=validate`, Flyway bật mặc định |
| Redis | ✅ | Cache / runtime infrastructure |
| Docker | ✅ | MySQL, Redis, backend, frontend và healthcheck |
| Production profile | ✅ Base | Có `application-prod.yml` với cấu hình fail-fast cho secrets/services |
| Automated tests | 🟡 | Đã có một số regression/contract tests; coverage chưa đủ |
| Integration / E2E tests | 🔴 | Cần bổ sung cho booking/payment/concurrency end-to-end |
| Observability | 🔴 | Chưa hoàn thiện metrics, tracing, error monitoring, reconciliation |
| Production hardening | 🟡 | Còn security/payment edge cases và deployment runbook |

---

## 🎯 Business flow chính

```text
Guest / Member
      ↓
Chọn phim
      ↓
Chọn rạp / suất chiếu
      ↓
Giữ ghế
      ↓
Chọn combo bắp / nước
      ↓
Áp dụng promotion
      ↓
Backend checkout
      ↓
Booking PENDING_PAYMENT
      ↓
MoMo
      ↓
Payment callback / IPN
      ↓
Booking CONFIRMED
      ↓
Seat BOOKED
      ↓
Issue Ticket
      ↓
QR Check-in
```

Backend là nguồn sự thật cho giá, promotion, inventory, ownership và trạng thái booking/payment. Frontend không được tự quyết định tổng tiền hoặc trạng thái giao dịch.

---

## 🧱 Kiến trúc

### Backend

```text
Controller
   ↓
Application / Business Services
   ├── Authentication
   ├── Booking Checkout
   ├── Seat Hold / Expiration
   ├── Cancellation
   ├── Refund
   ├── Payment
   ├── Ticket
   ├── Promotion
   └── Concession Inventory
          ↓
Repositories / Integrations
   ├── MySQL
   ├── Redis
   ├── WebSocket
   ├── SMTP
   └── MoMo
```

Các business flow quan trọng sử dụng transaction và row-level locking thay vì chỉ dựa vào CRUD `repository.save()`.

### Frontend

```text
React Router
    ↓
Pages / Features
    ↓
Service Layer
    ↓
Axios API Client
    ↓
Spring Boot REST API

Seat UI
    ↕
STOMP / WebSocket
```

---

## 🛠 Công nghệ

### Backend

| Thành phần | Công nghệ |
|---|---|
| Framework | Spring Boot 4.1.0 |
| Language | Java 25 |
| Build | Maven / Maven Wrapper |
| REST | Spring Web |
| Security | Spring Security |
| JWT | OAuth2 Resource Server / JOSE |
| Persistence | Spring Data JPA / Hibernate |
| Migration | Flyway |
| Database | MySQL |
| Cache | Redis / Spring Cache |
| Realtime | Spring WebSocket |
| Mapping | MapStruct 1.5.5.Final |
| Validation | Jakarta Validation |
| Mail | Spring Mail |
| API Docs | springdoc OpenAPI |
| Testing | Spring Boot Test / JUnit / Mockito |

### Frontend

| Thành phần | Công nghệ |
|---|---|
| Framework | React 19.1 |
| Build | Vite 7 |
| Router | React Router DOM 6 |
| HTTP | Axios |
| Realtime | STOMP + SockJS |
| UI primitives | Radix UI |
| Forms | React Hook Form |
| Animation | Framer Motion |
| Charts | Recharts |
| QR | qrcode |
| Testing | Vitest + jsdom |
| Lint | ESLint |

---

## 📁 Cấu trúc dự án

```text
HotCinema/
├── Backend/
│   ├── src/main/java/com/example/cinema/
│   │   ├── common/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── mapper/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── application-prod.yml
│   ├── src/test/
│   ├── Dockerfile
│   ├── pom.xml
│   └── mvnw
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   ├── scripts/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 👤 Nhóm người dùng

| Nhóm | Chức năng chính |
|---|---|
| Guest | Xem catalog phim, rạp, suất chiếu |
| Member | Giữ ghế, checkout, thanh toán, lịch sử booking, ticket, cancel/refund |
| Staff | Nghiệp vụ vận hành và ticket check-in tùy quyền được cấp |
| Admin | Quản trị dữ liệu và nghiệp vụ toàn hệ thống |

Backend phải tiếp tục giữ nguyên nguyên tắc **authorization + ownership ở server**, không dựa vào việc FE ẩn/hiện button.

---

## 🔐 Authentication & Security

Hệ thống sử dụng JWT access token và refresh token.

Luồng tổng quát:

```text
Login
  ↓
AuthenticationManager
  ↓
UserDetailsService
  ↓
JWT access + refresh token
  ↓
Authorization: Bearer <access-token>
  ↓
Spring Security
  ↓
Protected API
```

TTL mặc định:

| Token | TTL |
|---|---:|
| Access token | 900 giây / 15 phút |
| Refresh token | 604800 giây / 7 ngày |

Các khu vực cần hardening thêm trước production:

- refresh token rotation/reuse detection;
- rate-limit login/OTP/password reset;
- brute-force protection;
- audit privileged operations;
- production CORS/security headers;
- secret rotation và secret management.

---

## 💺 Seat Hold & Concurrency

Seat của một showtime sử dụng state chính:

```text
AVAILABLE
   ↓ hold
HELD
   ├── expire/cancel → AVAILABLE
   └── payment success → BOOKED
```

Core rules hiện có:

- seat được lock ở backend;
- hold gắn với user và thời gian hết hạn;
- checkout chỉ nhận seat đang `HELD` bởi đúng user;
- booking/payment finalize kiểm tra lại ownership và expiry;
- booking hết hạn trả ghế về `AVAILABLE`;
- cancellation/refund release seat phù hợp;
- WebSocket broadcast thay đổi trạng thái ghế.

Cần tiếp tục bổ sung **concurrency integration tests** với nhiều transaction thực trên database.

---

## 🎟 Booking Checkout

Checkout request không gửi `totalAmount` để backend tin trực tiếp.

Backend thực hiện:

```text
Validate seat IDs
      ↓
Lock ShowtimeSeat
      ↓
Validate HELD ownership + expiry
      ↓
Reserve concession inventory
      ↓
Calculate seat amount
      ↓
Calculate food amount
      ↓
Validate/reserve promotion
      ↓
Calculate discount
      ↓
Create Booking
      ↓
Create BookingSeat / BookingItem
```

Booking có các thành phần tiền chính:

```text
seatAmount
foodAmount
subtotal
promotion discount
totalAmount
```

---

## 🍿 F&B / Concession

Checkout hỗ trợ combo/product theo cinema.

Backend chịu trách nhiệm:

- xác thực product thuộc đúng cinema;
- kiểm tra product đang active/available;
- kiểm tra giá;
- lock inventory;
- kiểm tra stock;
- trừ stock khi checkout;
- hoàn stock khi booking unpaid bị cancel/expire;
- hoàn stock khi booking paid được refund.

Phần cần phát triển tiếp:

- inventory history/audit;
- low-stock alert;
- admin stock adjustment workflow;
- Booking Detail hiển thị đầy đủ BookingItem từ backend.

---

## 🎁 Promotion

Promotion được backend kiểm tra và áp dụng trên subtotal.

Các rule core gồm:

- thời gian hiệu lực;
- active status;
- minimum order;
- global usage;
- usage theo user;
- reservation khi checkout;
- release reservation khi booking expire/cancel.

Không nên duplicate pricing/promotion business rule ở frontend.

---

## 💳 Payment

### Provider đang hỗ trợ live

**MoMo** là payment provider live của flow hiện tại.

```text
POST payment initiate
       ↓
Lock Booking
       ↓
Validate PENDING_PAYMENT
       ↓
Create/reuse payment request
       ↓
MoMo payment URL
       ↓
Customer pays
       ↓
MoMo callback / IPN
       ↓
Verify provider result
       ↓
Lock Booking
       ↓
Lock Seats
       ↓
Booking CONFIRMED
Payment SUCCESS
Seats BOOKED
Issue Tickets
```

Frontend chỉ nên hiển thị provider đã thực sự được backend hỗ trợ. VNPay/ZaloPay chưa nên được coi là live nếu gateway server-side chưa hoàn thiện.

### Payment work còn lại

Các edge case quan trọng cần tiếp tục xử lý:

- callback success đến sau khi booking đã expire/cancel;
- provider success nhưng finalize nội bộ thất bại;
- callback/IPN duplicate hoặc out-of-order;
- auto-compensation/refund khi user đã bị charge nhưng booking không thể confirm;
- payment reconciliation;
- retry policy và manual-review state.

---

## 💸 Cancellation & Refund

### Cancellation

Member có thể hủy booking chưa thanh toán ở trạng thái phù hợp.

Cancellation thực hiện trong transaction:

- lock booking;
- xác thực ownership;
- release ghế;
- hoàn concession stock;
- xóa temporary booking items/seats phù hợp;
- release promotion reservation;
- cập nhật booking `CANCELLED`;
- broadcast seat availability sau commit.

### Refund

Booking đã thanh toán sử dụng refund flow thay vì direct cancellation.

Refund core hiện có:

- booking phải thuộc user;
- booking ở trạng thái đã thanh toán;
- suất chiếu chưa bắt đầu;
- ticket chưa check-in/USED;
- gọi MoMo refund;
- lưu PaymentTransaction refund;
- ticket → `REFUNDED`;
- seat → `AVAILABLE`;
- hoàn concession inventory;
- payment/booking → `REFUNDED`.

Phần cần hoàn thiện thêm là **refund policy có cấu hình**, ví dụ cutoff N phút/giờ, refund fee hoặc percentage theo business rule.

---

## 🎫 Ticket & QR

Ticket được phát hành sau payment success.

Ticket chứa QR token riêng, frontend dùng token này để render QR.

Các trạng thái chính:

```text
VALID
USED
CANCELLED
REFUNDED
```

Scanner phải kiểm tra trạng thái và thời gian hợp lệ trước khi mark `USED`.

Các cải tiến tiếp theo:

- My Tickets UX;
- Booking Detail hiển thị ticket/seat/F&B trực tiếp từ backend;
- file PDF ticket chuẩn nếu business cần PDF thật;
- check-in audit/history chi tiết hơn.

---

## 📚 Booking History / Booking Detail

Member sử dụng endpoint ownership-safe để lấy booking của chính mình thay vì admin API.

Booking History hiện đã hỗ trợ flow member và các trạng thái payment/cancel/refund cơ bản.

Booking Detail cần tiếp tục hoàn thiện để response backend chứa đầy đủ immutable booking snapshot, đặc biệt:

- danh sách ghế;
- danh sách BookingItem/F&B;
- promotion;
- payment summary;
- ticket summary;
- refund/cancel information.

Mục tiêu là không phụ thuộc dữ liệu tạm được truyền qua route state/local storage để dựng lại booking.

---

## 🧪 Testing

### Frontend

```bash
cd Frontend
npm install
npm test
```

Các script chính:

```bash
npm run dev
npm run build
npm run lint
npm test
npm run check
```

Đã có contract/regression tests cho một số service như booking và payment.

### Backend

Linux/macOS:

```bash
cd Backend
./mvnw test
```

Windows:

```powershell
cd Backend
.\mvnw.cmd test
```

Đã có regression tests cho một số rule cancellation/refund. Test suite vẫn cần mở rộng đáng kể.

### Test backlog ưu tiên

1. seat concurrency integration tests;
2. booking checkout success/failure transaction tests;
3. concession stock rollback/restore tests;
4. promotion reservation concurrency tests;
5. payment callback duplicate/out-of-order tests;
6. late MoMo callback compensation tests;
7. refund success/failure tests;
8. controller authorization/ownership tests;
9. frontend booking/payment component tests;
10. end-to-end booking → payment → ticket → scan.

---

## ⚙️ Chạy local

### Yêu cầu

- Java 25
- MySQL
- Redis
- Node.js + npm
- Maven không cần cài riêng nếu dùng Maven Wrapper

### 1. Backend

Tạo database hoặc để URL local tự tạo database `cinema` nếu MySQL user có quyền phù hợp.

Các biến môi trường thường dùng:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=cinema
MYSQL_USERNAME=root
MYSQL_PASSWORD=

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=change-this-local-secret

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_AUTH=false
SMTP_STARTTLS=false

MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_REDIRECT_URL=http://localhost:5173/booking/callback
MOMO_IPN_URL=<public-callback-url>/api/v1/paymentwebhooks/momo
```

Chạy backend:

```bash
cd Backend
./mvnw spring-boot:run
```

Windows:

```powershell
cd Backend
.\mvnw.cmd spring-boot:run
```

Backend mặc định chạy tại port `8080`.

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Cấu hình API base URL bằng biến Vite khi cần:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 🐳 Chạy bằng Docker Compose

Root project đã có stack gồm:

- MySQL 8.4;
- Redis 7;
- Spring Boot backend;
- React/Nginx frontend.

Chạy:

```bash
docker compose up --build
```

Mặc định:

| Service | Port host |
|---|---:|
| Frontend | 80 |
| Backend | 8080 |
| MySQL | 3306 |
| Redis | 6379 |

Healthcheck backend sử dụng public catalog endpoint:

```text
GET /api/v1/movies
```

> Giá trị secret mặc định trong compose chỉ phù hợp cho local/dev. Không sử dụng chúng trong production.

---

## 🚀 Production Profile

Backend có:

```text
Backend/src/main/resources/application-prod.yml
```

Kích hoạt bằng:

```env
SPRING_PROFILES_ACTIVE=prod
```

Production profile yêu cầu explicit configuration cho các dependency/secrets quan trọng, ví dụ:

```env
MYSQL_HOST=
MYSQL_PORT=3306
MYSQL_DATABASE=
MYSQL_USERNAME=
MYSQL_PASSWORD=
MYSQL_SSL_MODE=REQUIRED

REDIS_HOST=
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_AUTH=true
SMTP_STARTTLS=true

JWT_SECRET=
JWT_ISSUER=hotcinema

MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_REDIRECT_URL=
MOMO_IPN_URL=
```

Production profile hiện:

- bật Flyway;
- sử dụng `ddl-auto=validate` từ base config;
- tắt SQL logging;
- tắt OpenAPI/Swagger UI;
- không expose error message, binding error hoặc stacktrace;
- hỗ trợ forwarded headers;
- không có fallback JWT secret production.

---

## 🗃 Database & Flyway

Base configuration:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
```

Nguyên tắc:

- schema thay đổi bằng migration;
- không dùng `ddl-auto=update` cho production;
- migration phải review trước deploy;
- backup database trước migration có rủi ro;
- cần tiếp tục audit index/unique constraint cho booking/payment/concurrency.

---

## 🔭 Roadmap còn lại

### P0 — Hoàn thiện business correctness

- [ ] Late MoMo callback sau booking expire/cancel
- [ ] Payment compensation / auto-refund nếu provider đã charge nhưng booking không thể confirm
- [ ] Payment idempotency/reconciliation hardening
- [ ] Configurable refund cutoff/policy
- [ ] Booking Detail trả seat/F&B/payment/ticket snapshot đầy đủ
- [ ] FE ↔ BE API contract audit toàn bộ service/controller

### P1 — Admin & product completeness

- [ ] Audit Admin Movie/Cinema/Auditorium/Showtime contracts
- [ ] Audit Admin Booking/Payment/Refund workflow
- [ ] Inventory adjustment/history cho concession
- [ ] Promotion management UX và usage history
- [ ] My Tickets UX hoàn chỉnh
- [ ] Booking History pagination/filter/search
- [ ] Chuẩn hóa loading/error/empty state trên frontend
- [ ] Responsive seat map/payment/admin tables

### P1 — Testing

- [ ] Booking integration tests
- [ ] Seat concurrency tests
- [ ] Payment webhook tests
- [ ] Refund success-path tests
- [ ] Security/ownership controller tests
- [ ] Frontend component tests
- [ ] E2E booking/payment/ticket/check-in

### P2 — Production readiness

- [ ] Rate limiting
- [ ] Audit logging
- [ ] Structured logging + correlation ID
- [ ] Metrics / monitoring / error tracking
- [ ] Payment reconciliation dashboard/job
- [ ] HTTPS/reverse proxy deployment config
- [ ] Secret manager integration
- [ ] MySQL backup/restore runbook
- [ ] Redis persistence policy
- [ ] Resource limits/readiness strategy
- [ ] Production deployment documentation

### P3 — Payment providers mở rộng

- [ ] VNPay gateway
- [ ] VNPay return/IPN verification
- [ ] VNPay refund
- [ ] ZaloPay nếu business yêu cầu

Không nên đưa provider vào UI checkout trước khi backend gateway, callback verification và refund lifecycle đã triển khai đầy đủ.

---

## ✅ Definition of Done đề xuất

HotCinema có thể được xem là production-ready khi tối thiểu đạt các điều kiện:

```text
Core booking flows pass
        +
Concurrency tests pass
        +
Payment duplicate/late callback safe
        +
Refund policy deterministic
        +
Authorization/ownership verified
        +
Integration/E2E tests pass
        +
Secrets externalized
        +
Monitoring + reconciliation available
        +
Backup/restore + deployment runbook documented
```

---

## ⚠️ Lưu ý phát triển

- Không tin giá, discount hoặc status do frontend gửi lên.
- Không cho user truy cập booking/payment/ticket của user khác.
- Không đổi booking/payment status bằng generic admin action nếu bypass state machine.
- Payment callback phải idempotent.
- Không reopen ghế của booking đã charge nếu chưa giải quyết compensation/refund.
- Ticket chỉ hợp lệ khi payment/booking lifecycle hợp lệ.
- Mọi thay đổi inventory/promotion/seat quan trọng phải nằm trong transaction phù hợp.
- Secrets production không được commit vào repository.

---

## 📄 License

Chưa khai báo license chính thức trong repository.
