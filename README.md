# 🎬 HotCinema

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-25-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF.svg)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D.svg)](https://redis.io/)

HotCinema là hệ thống đặt vé và quản lý rạp chiếu phim được phát triển theo hướng gần production, gồm **Java Spring Boot backend**, **React frontend**, **PostgreSQL** và **Redis**.

Mục tiêu nghiệp vụ chính:

```text
Chọn phim
   ↓
Chọn rạp
   ↓
Chọn ngày
   ↓
Chọn suất chiếu
   ↓
Chọn ghế
   ↓
Chọn combo bắp / nước
   ↓
Thanh toán
   ↓
Nhận vé / QR Code
```

> **Trạng thái dự án:** đang phát triển. Domain model và CRUD nền tảng đã tương đối đầy đủ, nhưng các business flow quan trọng như seat hold, checkout orchestration, payment callback, ticket/QR và authorization theo ownership vẫn đang được hoàn thiện.

---

## 📌 Trạng thái hiện tại

| Khu vực | Trạng thái | Ghi chú |
|---|---|---|
| Domain / Entity model | ✅ Nền tảng tốt | Movie, Cinema, Auditorium, Seat, Showtime, Booking, Payment, Ticket, Promotion... |
| Repository / Mapper / CRUD Service | ✅ Có | Phần lớn domain đã có CRUD cơ bản |
| Authentication service | 🟡 Đang hoàn thiện | Login service, password validation, access token và refresh token đã có |
| JWT access token generation | ✅ Có | HS256, access token mặc định 15 phút |
| Refresh token generation | ✅ Có | Mặc định 7 ngày; rotation/revocation flow chưa hoàn thiện |
| UserDetails / Roles | ✅ Có | Load user theo email và map role sang `ROLE_*` |
| Auth HTTP endpoints | 🟡 Chưa nối hoàn chỉnh | `AuthController` hiện chưa expose login/register |
| Bearer JWT validation | 🟡 Chưa hoàn thiện | Cần nối `JwtDecoder` / Resource Server vào `SecurityFilterChain` |
| Role authorization | 🟡 Cơ bản | Có Spring Security nhưng rule nghiệp vụ chưa hoàn chỉnh |
| Resource ownership | ❌ Chưa có | Ví dụ customer chỉ được xem booking của chính mình |
| Booking orchestration | ❌ Chưa có | Booking hiện chủ yếu là CRUD |
| Seat hold / concurrency | ❌ Chưa có | Chưa có cơ chế chống double-booking hoàn chỉnh |
| Pricing engine | ❌ Chưa có | Cần tính giá ghế, suất chiếu, combo, promotion ở backend |
| Payment orchestration | ❌ Chưa có | Payment/Webhook hiện chưa có flow provider chuẩn |
| Ticket / QR lifecycle | ❌ Chưa hoàn thiện | Cần generate sau payment success và validate khi scan |
| Flyway migration | 🟡 Dependency có | Hiện `spring.flyway.enabled=false`, Hibernate vẫn dùng `ddl-auto=update` |
| Automated tests | 🔴 Rất ít | Cần bổ sung auth, booking, payment, concurrency, ticket tests |
| CI/CD | 🟡 Có workflow | Cần tiếp tục chuẩn hóa build/test pipeline |

---

## 🧱 Kiến trúc mục tiêu

Backend không nên dừng ở mô hình CRUD thuần:

```text
Controller
   ↓
Application / Use-case Service
   ├── Domain Services
   ├── Integration Services
   │      ├── Payment Provider
   │      ├── Redis
   │      └── Notification
   └── Repositories
          ↓
      PostgreSQL
```

Ví dụ booking flow mục tiêu:

```text
BookingController
      ↓
BookingApplicationService / CheckoutService
      ├── SeatAvailabilityService
      ├── SeatHoldService
      ├── PricingService
      ├── PromotionService
      ├── PaymentService
      └── TicketService
```

Mục tiêu là chuyển dần từ:

```text
Controller → Generic CRUD Service → repository.save()
```

sang:

```text
Controller → Business Use Case → Domain Rules → Repository / Integration
```

---

## 🛠 Công nghệ sử dụng

### Backend

| Thành phần | Công nghệ |
|---|---|
| Framework | Spring Boot 4.1.0 |
| Language | Java 25 |
| Build | Maven / Maven Wrapper |
| REST API | Spring Web |
| Security | Spring Security |
| JWT | Spring Security OAuth2 Resource Server / JOSE |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Migration | Flyway |
| Cache | Redis / Spring Cache |
| Mapping | MapStruct 1.5.5.Final |
| Validation | Jakarta Validation / Spring Validation |
| API Docs | springdoc OpenAPI |
| Boilerplate | Lombok |

### Frontend

| Thành phần | Công nghệ |
|---|---|
| Framework | React 19.1.0 |
| Build tool | Vite 7 |
| Routing | React Router DOM 6 |
| HTTP | Axios |
| UI primitives | Radix UI |
| Styling utilities | Tailwind CSS, CVA, clsx, tailwind-merge |
| Forms | React Hook Form |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React, React Icons |
| QR | qrcode |
| Testing | Vitest + jsdom |
| Lint | ESLint |

---

## 📁 Cấu trúc dự án

```text
HotCinema/
├── .github/
│   └── workflows/              # CI workflows
│
├── Backend/
│   ├── src/main/java/com/example/cinema/
│   │   ├── common/             # Common response / shared models
│   │   ├── config/             # Security, JWT, application configuration
│   │   ├── controller/         # REST controllers
│   │   ├── dto/                # Request / response DTOs
│   │   ├── entity/             # JPA entities
│   │   │   └── enums/
│   │   ├── exception/          # Application exceptions / global handler
│   │   ├── mapper/             # MapStruct mappers
│   │   ├── repository/         # Spring Data repositories
│   │   ├── security/           # UserDetails, JWT, security handlers
│   │   └── service/
│   │       └── impl/           # Service implementations
│   │
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/
│   ├── pom.xml
│   └── mvnw
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── scripts/
│   ├── package.json
│   └── vite.config.*
│
├── docker-compose.yml
└── README.md
```

---

## 👤 Vai trò người dùng mục tiêu

HotCinema được định hướng hỗ trợ các role sau:

| Role | Trách nhiệm |
|---|---|
| Guest | Xem phim, rạp, suất chiếu, tình trạng ghế |
| Customer | Đặt vé, thanh toán, xem booking/ticket cá nhân |
| Staff | Hỗ trợ bán vé tại quầy, scan ticket |
| Theater Manager | Quản lý rạp, phòng, ghế, suất chiếu thuộc phạm vi rạp |
| Admin | Quản lý user, role và dữ liệu toàn hệ thống |

> Authorization theo role và ownership vẫn cần được hoàn thiện ở backend trước khi xem là production-ready.

---

## 🔐 Authentication hiện tại

Backend hiện đã có phần service-level authentication:

```text
LoginRequest(email, password)
        ↓
AuthenticationManager
        ↓
DaoAuthenticationProvider
        ↓
CustomUserDetailsService
        ↓
PasswordEncoder
        ↓
User + Roles
        ↓
JwtTokenService
        ↓
AuthResponse(accessToken, refreshToken)
```

Access token hiện chứa các claim chính:

```text
iss
sub = userId
jti
email
roles
token_type = access
exp
```

Refresh token sử dụng cùng JWT encoder nhưng có:

```text
token_type = refresh
```

Thời gian mặc định:

| Token | TTL |
|---|---:|
| Access Token | 900 giây / 15 phút |
| Refresh Token | 604800 giây / 7 ngày |

### Việc authentication còn phải làm

```text
HTTP Login Endpoint
      ↓
Issue Access Token
      ↓
Client sends Authorization: Bearer <token>
      ↓
JwtDecoder
      ↓
Validate signature / issuer / expiry
      ↓
Convert roles → GrantedAuthority
      ↓
SecurityContext
      ↓
Protected API
```

Các phần còn thiếu quan trọng:

- expose `login`, `register`, `refresh`, `logout`, `me` từ `AuthController`;
- nối JWT decoder vào `SecurityFilterChain`;
- chuẩn hóa public/private routes;
- refresh token rotation/revocation;
- logout invalidation;
- resource ownership authorization;
- auth integration tests.

---

## 🎟 Booking flow mục tiêu

Booking không được để client tự gửi trạng thái hoặc tổng tiền rồi lưu trực tiếp.

Flow mục tiêu:

```text
Customer
   ↓
Choose Showtime
   ↓
Select Seats
   ↓
Validate Availability
   ↓
Hold Seats
   ↓
Calculate Price
   ↓
Add Products / Combos
   ↓
Apply Promotion
   ↓
Create Booking
   ↓
Create Payment
   ↓
Payment Provider
   ↓
Webhook / IPN
   ↓
Confirm Payment
   ↓
Finalize Seats
   ↓
Generate Ticket / QR
```

### Booking state đề xuất

```text
PENDING
   ├──→ PAYMENT_FAILED
   ├──→ EXPIRED
   ├──→ CANCELLED
   └──→ PAID
          ↓
      CONFIRMED
          ↓
      COMPLETED
```

Refund flow có thể mở rộng với:

```text
REFUND_PENDING → REFUNDED
```

---

## 💺 Seat hold và chống double-booking

Đây là một trong các phần backend quan trọng nhất cần triển khai.

State mục tiêu:

```text
AVAILABLE → HELD → BOOKED
```

Seat hold nên có tối thiểu:

```text
id
showtime_id
seat_id
user_id
booking_id
expires_at
created_at
```

Các nguyên tắc bắt buộc:

- seat hold phải atomic;
- một ghế trong cùng showtime không thể được hold/book đồng thời bởi hai booking;
- hold phải có thời gian hết hạn;
- payment success chuyển seat thành `BOOKED`;
- hold hết hạn phải release;
- database constraint phải là lớp bảo vệ cuối cùng;
- cần concurrency integration test.

Test mục tiêu:

```text
20 requests cùng giữ 1 ghế
        ↓
chỉ đúng 1 request thành công
```

---

## 💳 Payment flow mục tiêu

Payment và webhook không nên được expose dưới dạng generic CRUD.

Flow chuẩn:

```text
POST /payment/initiate
        ↓
Create payment request
        ↓
Payment Provider
        ↓
Provider callback / webhook
        ↓
Verify signature
        ↓
Validate booking + amount
        ↓
Idempotency check
        ↓
Persist transaction / webhook event
        ↓
Update Payment
        ↓
Update Booking
        ↓
Finalize Seats
        ↓
Generate Ticket
```

Webhook phải hỗ trợ retry an toàn. Cùng một provider transaction/event ID không được tạo nhiều ticket hoặc xác nhận booking nhiều lần.

MoMo là payment provider ưu tiên đầu tiên của dự án.

---

## 🧮 Pricing và Promotion

Tổng tiền phải được tính lại hoàn toàn ở backend.

```text
Seat base price
+ Seat type surcharge
+ Showtime pricing
+ Products / combos
- Promotion discount
+ Applicable fees
= Final total
```

Backend không được tin `totalAmount` do frontend gửi lên.

---

## 🎫 Ticket / QR

Ticket chỉ được phát hành sau khi payment được xác nhận thành công.

QR không nên chỉ chứa raw ticket ID. Nên sử dụng signed/tokenized payload để có thể xác minh tính hợp lệ.

Scan flow mục tiêu:

```text
Scan QR
   ↓
Validate signature
   ↓
Validate ticket
   ↓
Validate showtime
   ↓
Validate ticket status
   ↓
Mark as used
```

Scan lần hai phải trả trạng thái `already used` thay vì tiếp tục cho phép vào rạp.

---

## ⚙️ Cấu hình backend

File hiện tại:

```text
Backend/src/main/resources/application.properties
```

### Database

Mặc định development hiện tại:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cinema
spring.datasource.username=postgres
spring.datasource.password=123456
```

Có thể override bằng environment variables của Spring Boot:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cinema
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
```

> Không sử dụng credential development mặc định trong staging/production.

### Redis

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

Có thể override:

```bash
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
```

### JWT

Các property hiện hỗ trợ:

```properties
app.security.jwt.secret=${JWT_SECRET:hotcinema-dev-secret-key-change-before-production-2026}
app.security.jwt.issuer=${JWT_ISSUER:hotcinema}
app.security.jwt.access-token-seconds=${JWT_ACCESS_TOKEN_SECONDS:900}
app.security.jwt.refresh-token-seconds=${JWT_REFRESH_TOKEN_SECONDS:604800}
```

Production bắt buộc cấu hình secret riêng:

```bash
JWT_SECRET=<strong-random-secret-at-least-32-bytes>
JWT_ISSUER=hotcinema
JWT_ACCESS_TOKEN_SECONDS=900
JWT_REFRESH_TOKEN_SECONDS=604800
```

Không commit production secret vào Git.

---

## 🗄 Database migration

Hiện tại project vẫn đang dùng:

```properties
spring.jpa.hibernate.ddl-auto=update
spring.flyway.enabled=false
```

Đây chỉ nên là trạng thái development tạm thời.

Target:

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
```

Migration structure mục tiêu:

```text
Backend/src/main/resources/db/migration/
├── V1__initial_schema.sql
├── V2__seed_roles.sql
├── V3__seed_seat_types.sql
├── V4__booking_constraints.sql
└── ...
```

---

## 🚀 Chạy local

### Yêu cầu

Backend:

```text
JDK 25
PostgreSQL
Redis
```

Frontend:

```text
Node.js 18+
npm
```

### 1. Clone repository

```bash
git clone https://github.com/Vo-Xuan-Duong/HotCinema.git
cd HotCinema
```

### 2. Tạo database

```sql
CREATE DATABASE cinema;
```

### 3. Chạy Redis

Nếu đã cài Redis local:

```bash
redis-server
```

Hoặc chỉ chạy Redis bằng Docker:

```bash
docker run --name hotcinema-redis -p 6379:6379 -d redis:7-alpine
```

### 4. Chạy backend

Windows:

```powershell
cd Backend
.\mvnw.cmd spring-boot:run
```

Linux / macOS:

```bash
cd Backend
./mvnw spring-boot:run
```

Backend mặc định:

```text
http://localhost:8080
```

### 5. Chạy frontend

```bash
cd Frontend
npm install
npm run dev
```

Vite mặc định:

```text
http://localhost:5173
```

---

## 🐳 Docker

Repository có `docker-compose.yml` cho backend application và Redis.

```bash
docker compose up --build
```

Hiện compose chưa khai báo PostgreSQL service, vì vậy backend vẫn cần kết nối tới một PostgreSQL instance phù hợp thông qua cấu hình datasource.

---

## 🧪 Kiểm tra frontend

Frontend đã có các script:

```bash
npm run lint
npm test
npm run build
npm run check
```

`npm run check` thực hiện chuỗi kiểm tra UI audit, lint, test và build.

---

## 📚 API Documentation

Backend sử dụng springdoc OpenAPI.

Khi backend chạy thành công, Swagger UI theo cấu hình mặc định thường được truy cập tại:

```text
http://localhost:8080/swagger-ui/index.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

> API surface hiện vẫn đang được chuẩn hóa. Không nên coi các generic CRUD endpoint hiện tại là contract cuối cùng của hệ thống.

---

## 🗺 Backend roadmap

Ưu tiên backend hiện tại:

| Priority | Work item | Mục tiêu |
|---|---|---|
| P0 | Authentication HTTP API | Login/register/refresh/logout/me hoạt động end-to-end |
| P0 | JWT request authentication | Bearer token được verify ở mọi protected API |
| P0 | Flyway | Migration-first database |
| P0 | Booking orchestration | Checkout use case thay cho generic CRUD |
| P0 | Seat hold | Atomic hold + timeout + chống double booking |
| P0 | Pricing | Backend tính toàn bộ giá booking |
| P0 | MoMo payment | Initiate + callback + signature + idempotency |
| P1 | Authorization | Role + resource ownership |
| P1 | Ticket / QR | Issue, validate, scan, prevent reuse |
| P1 | Tests | Integration + concurrency + security tests |
| P1 | CI | Compile + test backend, lint/test/build frontend |
| P2 | Observability | Logging, audit, metrics, health checks |
| P2 | Deployment | Environment config, container hardening, production setup |

---

## 🎯 Development principles

1. Không thêm generic CRUD chỉ vì entity tồn tại.
2. Ưu tiên business use case end-to-end.
3. Backend là nguồn sự thật cho giá, trạng thái booking và payment.
4. Không tin dữ liệu nhạy cảm do client gửi lên.
5. Mọi payment webhook phải verify signature và idempotent.
6. Seat booking phải có concurrency control ở cả application và database layer.
7. Authorization phải kiểm tra cả role và ownership.
8. Database schema production phải quản lý bằng migration.
9. Business-critical flow phải có integration test.
10. Secret và credential production không được commit vào repository.

---

## 🔜 Bước backend tiếp theo

Bước tiếp theo nên hoàn thiện authentication end-to-end theo thứ tự:

```text
AuthController
   ↓
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
   ↓
JwtDecoder
   ↓
Bearer Token Authentication
   ↓
SecurityContext
   ↓
Role / Ownership Authorization
```

Sau khi authentication chạy hoàn chỉnh, chuyển sang **Seat Hold + Booking Application Service** trước khi tích hợp payment.

---

## 📄 License

Chưa xác định license chính thức cho repository này.

---

**HotCinema** — Cinema booking platform built with Spring Boot, React, PostgreSQL and Redis.
