# 🎬 HotCinemas - Hệ Thống Quản Lý Rạp Chiếu Phim

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

HotCinemas là một hệ thống quản lý rạp chiếu phim toàn diện, được xây dựng với kiến trúc hiện đại, hỗ trợ đặt vé trực tuyến, thanh toán điện tử, và quản lý rạp chiếu phim một cách chuyên nghiệp.

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [API Documentation](#-api-documentation)
- [Tính Năng Chi Tiết](#-tính-năng-chi-tiết)
- [Đóng Góp](#-đóng-góp)
- [License](#-license)

## ✨ Tính Năng

### 👥 Người Dùng
- ✅ **Đăng ký/Đăng nhập** với xác thực OTP qua email
- ✅ **Xem danh sách phim** với bộ lọc và tìm kiếm nâng cao
- ✅ **Chi tiết phim** với trailer, đánh giá, bình luận
- ✅ **Xem lịch chiếu** theo rạp, theo phim, theo ngày
- ✅ **Đặt vé trực tuyến** với chọn ghế trực quan
- ✅ **Thanh toán** qua MoMo, VNPay, chuyển khoản, tiền mặt
- ✅ **Quản lý đặt vé** - xem lịch sử, chi tiết, hủy vé
- ✅ **Giỏ hàng** - lưu vé tạm thời trước khi thanh toán
- ✅ **Thông báo real-time** qua WebSocket
- ✅ **Hỗ trợ chat** trực tuyến
- ✅ **Dark/Light mode** - giao diện tối/sáng
- ✅ **Responsive design** - tối ưu cho mọi thiết bị

### 🔧 Quản Trị Viên
- ✅ **Dashboard** với thống kê và biểu đồ
- ✅ **Quản lý phim** - CRUD đầy đủ, upload poster
- ✅ **Quản lý rạp** - thêm/sửa rạp, phòng chiếu
- ✅ **Quản lý lịch chiếu** - tạo, cập nhật, xóa suất chiếu
- ✅ **Quản lý ghế** - cấu hình sơ đồ ghế, loại ghế
- ✅ **Quản lý đặt vé** - xem, duyệt, hủy đặt vé
- ✅ **Quản lý người dùng** - phân quyền, kích hoạt/tắt tài khoản
- ✅ **Quản lý bình luận** - duyệt, xóa bình luận
- ✅ **Quản lý khuyến mãi** - tạo mã giảm giá, voucher
- ✅ **Báo cáo doanh thu** - thống kê theo thời gian
- ✅ **Quản lý nhân viên** - phân quyền nhân viên
- ✅ **Cài đặt hệ thống** - cấu hình toàn hệ thống

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Framework**: Spring Boot 3.5.3
- **Language**: Java 21
- **Build Tool**: Maven
- **Database**: PostgreSQL
- **Cache**: Redis
- **Security**: Spring Security + JWT
- **Documentation**: Swagger/OpenAPI 3
- **WebSocket**: Spring WebSocket (STOMP)
- **File Storage**: Cloudinary
- **Payment**: MoMo Payment Gateway
- **Email**: Spring Mail (Gmail SMTP)
- **PDF Generation**: OpenHTMLToPDF
- **QR Code**: ZXing

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.0
- **UI Library**: Ant Design 5.26.6
- **Routing**: React Router DOM 6.30.1
- **HTTP Client**: Axios 1.10.0
- **WebSocket**: STOMP.js + SockJS
- **Charts**: Recharts 3.1.0
- **Icons**: React Icons, Lucide React, Ant Design Icons
- **Date/Time**: Day.js, Moment.js
- **QR Code**: qrcode
- **Carousel**: Swiper 11.2.10

## 📁 Cấu Trúc Dự Án

```
hotcinemas/
├── Backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/hotcinemas_be/
│   │   │   │   ├── config/          # Cấu hình (Security, Redis, WebSocket, ...)
│   │   │   │   ├── controllers/      # REST Controllers
│   │   │   │   ├── dtos/            # Data Transfer Objects
│   │   │   │   ├── enums/           # Enumeration classes
│   │   │   │   ├── exceptions/      # Exception handling
│   │   │   │   ├── jwts/            # JWT utilities
│   │   │   │   ├── mappers/         # Entity-DTO mappers
│   │   │   │   ├── models/          # JPA entities
│   │   │   │   ├── repositorys/     # Data repositories
│   │   │   │   ├── services/        # Business logic
│   │   │   │   └── specifications/  # JPA Specifications
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/              # Database scripts
│   │   └── test/                    # Test classes
│   ├── pom.xml
│   └── README.md
│
├── Frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Auth/          # Authentication components
│   │   │   ├── Booking/       # Booking components
│   │   │   ├── Movie/         # Movie components
│   │   │   ├── Cinema/        # Cinema components
│   │   │   ├── Admin/         # Admin components
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── User/          # User pages
│   │   │   ├── Admin/         # Admin pages
│   │   │   └── Auth/          # Auth pages
│   │   ├── services/          # API services
│   │   ├── context/           # React Context (Auth, Theme, ...)
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   ├── layouts/           # Layout components
│   │   ├── styles/            # Global styles
│   │   └── data/              # Mock data (JSON)
│   ├── public/                # Static files
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
└── README.md                   # File này
```

## 💻 Yêu Cầu Hệ Thống

### Backend
- **Java**: JDK 21 hoặc cao hơn
- **Maven**: 3.6+ (hoặc sử dụng Maven Wrapper)
- **PostgreSQL**: 12+ 
- **Redis**: 6.0+
- **IDE**: IntelliJ IDEA, Eclipse, hoặc VS Code (với Java extensions)

### Frontend
- **Node.js**: 18.0+ hoặc cao hơn
- **npm**: 9.0+ hoặc **yarn** 1.22+
- **Browser**: Chrome, Firefox, Edge, Safari (phiên bản mới nhất)

## 🚀 Cài Đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd hotcinemas
```

### 2. Cài Đặt Backend

```bash
cd Backend

# Sử dụng Maven Wrapper (khuyến nghị)
./mvnw clean install

# Hoặc sử dụng Maven đã cài đặt
mvn clean install
```

### 3. Cài Đặt Frontend

```bash
cd Frontend

# Cài đặt dependencies
npm install

# Hoặc sử dụng yarn
yarn install
```

### 4. Cài Đặt Database

1. Tạo database PostgreSQL:
```sql
CREATE DATABASE hotcinemas;
```

2. Cấu hình trong `Backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hotcinemas
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Database sẽ tự động tạo schema khi chạy ứng dụng (với `spring.jpa.hibernate.ddl-auto=update`)

### 5. Cài Đặt Redis

**Windows:**
- Tải Redis từ: https://github.com/microsoftarchive/redis/releases
- Hoặc sử dụng WSL2 với Redis

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Mac (Homebrew)
brew install redis
```

Khởi động Redis:
```bash
redis-server
```

## ⚙️ Cấu Hình

### Backend Configuration

Chỉnh sửa file `Backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/hotcinemas
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT
jwt.secret.access=your_access_secret_key_min_256_bits
jwt.secret.refresh=your_refresh_secret_key_min_256_bits
jwt.expiration.access=86400000  # 24 hours
jwt.expiration.refresh=604800000 # 7 days
jwt.issuer=hotcinemas

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# CORS (thêm domain frontend của bạn)
cors_allowed_origins=http://localhost:5173,http://localhost:3000

# Email (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password  # App Password từ Google Account

# Cloudinary
cloudinary.url=cloudinary://api_key:api_secret@cloud_name

# MoMo Payment (Test Environment)
momo.partnerCode=your_partner_code
momo.accessKey=your_access_key
momo.secretKey=your_secret_key
momo.endPoint=https://test-payment.momo.vn/v2/gateway/api/create
momo.redirectUrl=http://localhost:5173/booking/callback
momo.ipnUrl=http://your-domain.com/api/v1/payments/momo-callback
```

### Frontend Configuration

Chỉnh sửa file `Frontend/src/utils/apiClient.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

## 🏃 Chạy Ứng Dụng

### Chạy Backend

```bash
cd Backend

# Sử dụng Maven Wrapper
./mvnw spring-boot:run

# Hoặc chạy JAR file
java -jar target/hotcinemas_be-0.0.1-SNAPSHOT.jar
```

Backend sẽ chạy tại: `http://localhost:8080`

### Chạy Frontend

```bash
cd Frontend

# Development mode
npm run dev

# Hoặc sử dụng yarn
yarn dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### Chạy Cả Hai (Windows)

Sử dụng script có sẵn:
```bash
# Từ thư mục Frontend
start-dev.bat
```

### Chạy Cả Hai (Linux/Mac)

```bash
# Từ thư mục Frontend
./start-dev.sh
```

## 📚 API Documentation

Khi backend đang chạy, truy cập:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

### Các Endpoint Chính

#### Authentication
- `POST /api/v1/auth/register` - Đăng ký tài khoản
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh` - Làm mới token
- `POST /api/v1/auth/verify-otp` - Xác thực OTP
- `POST /api/v1/auth/forgot-password` - Quên mật khẩu
- `POST /api/v1/auth/reset-password` - Đặt lại mật khẩu

#### Movies
- `GET /api/v1/movies` - Danh sách phim (có phân trang, lọc, tìm kiếm)
- `GET /api/v1/movies/{id}` - Chi tiết phim
- `POST /api/v1/movies` - Tạo phim mới (Admin)
- `PUT /api/v1/movies/{id}` - Cập nhật phim (Admin)
- `DELETE /api/v1/movies/{id}` - Xóa phim (Admin)

#### Cinemas
- `GET /api/v1/cinemas` - Danh sách rạp
- `GET /api/v1/cinemas/{id}` - Chi tiết rạp
- `POST /api/v1/cinemas` - Tạo rạp mới (Admin)
- `PUT /api/v1/cinemas/{id}` - Cập nhật rạp (Admin)

#### Showtimes
- `GET /api/v1/showtimes` - Danh sách lịch chiếu
- `GET /api/v1/showtimes/{id}` - Chi tiết lịch chiếu
- `POST /api/v1/showtimes` - Tạo lịch chiếu (Admin)
- `PUT /api/v1/showtimes/{id}` - Cập nhật lịch chiếu (Admin)

#### Bookings
- `GET /api/v1/bookings` - Danh sách đặt vé
- `GET /api/v1/bookings/{id}` - Chi tiết đặt vé
- `POST /api/v1/bookings` - Tạo đặt vé mới
- `PUT /api/v1/bookings/{id}/cancel` - Hủy đặt vé

#### Payments
- `POST /api/v1/payments` - Tạo thanh toán
- `GET /api/v1/payments/{id}` - Chi tiết thanh toán
- `POST /api/v1/payments/momo-callback` - Callback từ MoMo

#### Users
- `GET /api/v1/users` - Danh sách người dùng (Admin)
- `GET /api/v1/users/{id}` - Chi tiết người dùng
- `PUT /api/v1/users/{id}` - Cập nhật thông tin
- `PUT /api/v1/users/{id}/password` - Đổi mật khẩu

Xem chi tiết đầy đủ tại Swagger UI.

## 🎯 Tính Năng Chi Tiết

### Đặt Vé
1. Chọn phim và suất chiếu
2. Chọn ghế trên sơ đồ trực quan
3. Xem lại thông tin và giá
4. Chọn phương thức thanh toán
5. Thanh toán và nhận vé (PDF + QR Code)

### Quản Lý Rạp
- Quản lý thông tin rạp (tên, địa chỉ, hình ảnh)
- Quản lý phòng chiếu (loại phòng: 2D, 3D, IMAX, VIP)
- Cấu hình sơ đồ ghế (số hàng, số ghế, hàng VIP)
- Quản lý giá vé theo loại phòng và ghế

### Thống Kê & Báo Cáo
- Doanh thu theo ngày/tuần/tháng/năm
- Số lượng vé bán ra
- Phim phổ biến nhất
- Rạp có doanh thu cao nhất
- Biểu đồ trực quan với Recharts

### Real-time Features
- Thông báo đặt vé thành công
- Cập nhật trạng thái ghế real-time
- Chat hỗ trợ trực tuyến
- Thông báo khuyến mãi

## 🔒 Bảo Mật

- **JWT Authentication**: Access token và Refresh token
- **Password Encryption**: BCrypt
- **CORS Configuration**: Chỉ cho phép domain được cấu hình
- **Input Validation**: Jakarta Bean Validation
- **SQL Injection Protection**: JPA/Hibernate
- **XSS Protection**: Input sanitization
- **Rate Limiting**: Redis-based (có thể cấu hình)

## 🧪 Testing

### Backend Tests
```bash
cd Backend
./mvnw test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

## 📦 Build Production

### Backend
```bash
cd Backend
./mvnw clean package -DskipTests
# JAR file sẽ được tạo tại: target/hotcinemas_be-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd Frontend
npm run build
# Build files sẽ được tạo tại: dist/
```

## 🐛 Troubleshooting

### Backend không kết nối được database
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra thông tin kết nối trong `application.properties`
- Kiểm tra firewall/port 5432

### Frontend không kết nối được API
- Kiểm tra backend đã chạy chưa (http://localhost:8080)
- Kiểm tra CORS configuration trong backend
- Kiểm tra `API_BASE_URL` trong `apiClient.js`

### Redis connection error
- Kiểm tra Redis đã chạy chưa: `redis-cli ping` (phải trả về PONG)
- Kiểm tra host và port trong `application.properties`

### JWT token expired
- Token sẽ tự động refresh khi gần hết hạn
- Nếu refresh token hết hạn, cần đăng nhập lại

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng làm theo các bước sau:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Code Style

- **Backend**: Tuân thủ Java Code Conventions
- **Frontend**: Sử dụng ESLint configuration có sẵn
- **Commit Messages**: Sử dụng tiếng Việt hoặc tiếng Anh, mô tả rõ ràng

## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Liên Hệ & Hỗ Trợ

- **Email**: support@hotcinemas.com
- **Issues**: Tạo issue trên GitHub repository
- **Documentation**: Xem thêm tại [Backend/README.md](Backend/README.md)

## 🙏 Lời Cảm Ơn

Cảm ơn tất cả các contributors đã đóng góp cho dự án này!

---

**HotCinemas Team** © 2025

Made with ❤️ using Spring Boot & React
