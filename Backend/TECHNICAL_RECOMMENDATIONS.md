# TECHNICAL RECOMMENDATIONS - HOTCINEMAS BACKEND

## 🎯 EXECUTIVE SUMMARY

Hệ thống HotCinemas Backend có nền tảng kỹ thuật tốt nhưng cần một số cải tiến quan trọng trước khi triển khai production. Báo cáo này đưa ra các khuyến nghị kỹ thuật chi tiết với mức độ ưu tiên và timeline thực hiện.

---

## 1️⃣ SECURITY IMPROVEMENTS

### 1.1 Permission-Based Authorization (CRITICAL)

**Vấn đề hiện tại:**
```java
// SecurityConfig.java - LINE 84
http.authorizeHttpRequests(authorize ->
    authorize.requestMatchers(PUBLIC_ENDPOINTS).permitAll()
        .anyRequest().permitAll());  // ❌ Tất cả requests đều được phép!
```

**Giải pháp:**

#### Bước 1: Enable Method Security
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {
    // ...existing code...
}
```

#### Bước 2: Update SecurityConfig
```java
http.authorizeHttpRequests(authorize ->
    authorize
        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
        .anyRequest().authenticated()  // ✅ Yêu cầu authentication
);
```

#### Bước 3: Add @PreAuthorize Annotations
```java
// Example: MovieController
@PostMapping
@PreAuthorize("hasAuthority('MOVIE_CREATE')")
public ResponseEntity<?> createMovie(@Valid @RequestBody MovieRequest request) {
    // ...
}

@GetMapping("/{id}")
@PreAuthorize("hasAnyAuthority('MOVIE_READ', 'MOVIE_LIST')")
public ResponseEntity<?> getMovieById(@PathVariable Long id) {
    // ...
}

@PutMapping("/{id}")
@PreAuthorize("hasAuthority('MOVIE_UPDATE')")
public ResponseEntity<?> updateMovie(@PathVariable Long id, @Valid @RequestBody MovieRequest request) {
    // ...
}

@DeleteMapping("/{id}")
@PreAuthorize("hasAuthority('MOVIE_DELETE')")
public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
    // ...
}
```

#### Bước 4: Initialize Permission Data
Tạo file: `src/main/resources/db/migration/V2__insert_permissions.sql`

```sql
-- Insert Permissions
INSERT INTO permissions (name, description, module, created_at) VALUES
-- User Management
('USER_CREATE', 'Tạo người dùng mới', 'USER', CURRENT_TIMESTAMP),
('USER_READ', 'Xem thông tin người dùng', 'USER', CURRENT_TIMESTAMP),
('USER_LIST', 'Xem danh sách người dùng', 'USER', CURRENT_TIMESTAMP),
-- ... (total 120 permissions)

-- Assign all permissions to Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin';

-- Assign selected permissions to Staff role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'BOOKING_READ', 'BOOKING_LIST', 'BOOKING_UPDATE_STATUS',
    'MOVIE_READ', 'MOVIE_LIST', 'CINEMA_READ', 'CINEMA_LIST'
    -- ... staff permissions
)
WHERE r.name = 'Staff';
```

**Timeline:** 2-3 days  
**Priority:** 🔴 CRITICAL

---

### 1.2 Rate Limiting

**Khuyến nghị:** Sử dụng Bucket4j

**Implementation:**

#### Bước 1: Add Dependency
```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.5.0</version>
</dependency>
```

#### Bước 2: Create Rate Limit Filter
```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        String key = getClientIP(request);
        Bucket bucket = cache.computeIfAbsent(key, k -> createNewBucket());
        
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.getWriter().write("Too many requests");
        }
    }
}
```

**Timeline:** 1 day  
**Priority:** 🔴 CRITICAL

---

### 1.3 Security Headers

**Implementation:**

```java
@Configuration
public class SecurityHeadersConfig {
    
    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilter() {
        FilterRegistrationBean<SecurityHeadersFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new SecurityHeadersFilter());
        registrationBean.addUrlPatterns("/*");
        return registrationBean;
    }
}

public class SecurityHeadersFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Security headers
        httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        httpResponse.setHeader("X-Frame-Options", "DENY");
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        httpResponse.setHeader("Content-Security-Policy", "default-src 'self'");
        httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        
        chain.doFilter(request, response);
    }
}
```

**Timeline:** 2 hours  
**Priority:** 🟡 HIGH

---

## 2️⃣ DATABASE OPTIMIZATION

### 2.1 Migration to Flyway

**Vấn đề:** Sử dụng `spring.jpa.hibernate.ddl-auto=update` - không an toàn cho production

**Giải pháp:**

#### Bước 1: Add Flyway Dependency
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

#### Bước 2: Update application.properties
```properties
# Disable Hibernate DDL
spring.jpa.hibernate.ddl-auto=validate

# Enable Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
```

#### Bước 3: Create Migration Files
```
src/main/resources/db/migration/
├── V1__init_schema.sql
├── V2__insert_permissions.sql
├── V3__insert_roles_permissions.sql
├── V4__create_indexes.sql
└── V5__add_constraints.sql
```

**Timeline:** 3-4 days  
**Priority:** 🔴 CRITICAL

---

### 2.2 Database Indexing

**Recommendations:**

```sql
-- V4__create_indexes.sql

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Booking indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_showtime_id ON bookings(showtime_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);

-- Showtime indexes
CREATE INDEX idx_showtimes_movie_id ON showtimes(movie_id);
CREATE INDEX idx_showtimes_theater_id ON showtimes(theater_id);
CREATE INDEX idx_showtimes_show_date ON showtimes(show_date);
CREATE INDEX idx_showtimes_status ON showtimes(status);
CREATE INDEX idx_showtimes_movie_date ON showtimes(movie_id, show_date);

-- Payment indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Review indexes
CREATE INDEX idx_reviews_movie_id ON reviews(movie_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- MovieGenre indexes
CREATE INDEX idx_movie_genres_movie_id ON movie_genres(movie_id);
CREATE INDEX idx_movie_genres_genre_id ON movie_genres(genre_id);

-- Seat indexes
CREATE INDEX idx_seats_theater_id ON seats(theater_id);
CREATE INDEX idx_seats_status ON seats(seat_status);
```

**Timeline:** 1 day  
**Priority:** 🟡 HIGH

---

### 2.3 Database Constraints

```sql
-- V5__add_constraints.sql

-- Unique constraints
ALTER TABLE bookings ADD CONSTRAINT uk_booking_code UNIQUE (booking_code);
ALTER TABLE users ADD CONSTRAINT uk_user_email UNIQUE (email);

-- Check constraints
ALTER TABLE bookings ADD CONSTRAINT chk_booking_amounts 
    CHECK (total_amount >= 0 AND discount_amount >= 0 AND final_amount >= 0);

ALTER TABLE payments ADD CONSTRAINT chk_payment_amount 
    CHECK (amount >= 0);

ALTER TABLE showtimes ADD CONSTRAINT chk_showtime_times 
    CHECK (end_time > start_time);

ALTER TABLE reviews ADD CONSTRAINT chk_review_rating 
    CHECK (rating >= 1 AND rating <= 5);
```

**Timeline:** 2 hours  
**Priority:** 🟡 HIGH

---

## 3️⃣ TESTING STRATEGY

### 3.1 Unit Testing Framework

**Recommended Stack:**
- JUnit 5
- Mockito
- AssertJ

**Sample Test Structure:**

```java
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    
    @Mock
    private BookingRepository bookingRepository;
    
    @Mock
    private ShowtimeRepository showtimeRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private BookingService bookingService;
    
    @Test
    void createBooking_WithValidData_ShouldReturnBookingResponse() {
        // Given
        BookingRequest request = BookingRequest.builder()
            .showtimeId(1L)
            .seatIds(List.of(1L, 2L))
            .build();
        
        User user = new User();
        user.setId(1L);
        
        Showtime showtime = new Showtime();
        showtime.setId(1L);
        showtime.setBasePrice(new BigDecimal("50000"));
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(showtimeRepository.findById(1L)).thenReturn(Optional.of(showtime));
        
        // When
        BookingResponse response = bookingService.createBooking(request);
        
        // Then
        assertThat(response).isNotNull();
        assertThat(response.getBookingCode()).isNotEmpty();
        verify(bookingRepository).save(any(Booking.class));
    }
    
    @Test
    void createBooking_WithInvalidShowtime_ShouldThrowException() {
        // Given
        BookingRequest request = BookingRequest.builder()
            .showtimeId(999L)
            .build();
        
        when(showtimeRepository.findById(999L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> bookingService.createBooking(request))
            .isInstanceOf(AppException.class)
            .hasMessageContaining("Showtime not found");
    }
}
```

**Target Coverage:** 80% minimum

**Timeline:** 2-3 weeks  
**Priority:** 🔴 CRITICAL

---

### 3.2 Integration Testing

**Sample Integration Test:**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional
class BookingControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @WithMockUser(authorities = "BOOKING_CREATE")
    void createBooking_ShouldReturn201() throws Exception {
        BookingRequest request = BookingRequest.builder()
            .showtimeId(1L)
            .seatIds(List.of(1L, 2L))
            .build();
        
        mockMvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.bookingCode").exists());
    }
}
```

**Timeline:** 1-2 weeks  
**Priority:** 🟡 HIGH

---

## 4️⃣ PERFORMANCE OPTIMIZATION

### 4.1 Query Optimization

**Problem: N+1 Query Issues**

**Hiện tại:**
```java
// BookingService.java - Có thể gây N+1
public List<BookingResponse> getBookingsByUserId(Long userId) {
    List<Booking> bookings = bookingRepository.findBookingsByUserId(userId);
    return bookings.stream()
        .map(bookingMapper::mapToResponse)
        .toList();
}
```

**Giải pháp:** Use JOIN FETCH

```java
// BookingRepository.java
@Query("SELECT DISTINCT b FROM Booking b " +
       "LEFT JOIN FETCH b.showtime s " +
       "LEFT JOIN FETCH s.movie " +
       "LEFT JOIN FETCH s.theater t " +
       "LEFT JOIN FETCH t.cinema " +
       "WHERE b.user.id = :userId")
List<Booking> findBookingsByUserIdWithDetails(@Param("userId") Long userId);
```

**Timeline:** 3-4 days  
**Priority:** 🟡 HIGH

---

### 4.2 Caching Enhancement

**Recommendations:**

```java
// Add cache configuration
@Configuration
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // Different TTL for different caches
        cacheConfigurations.put("movies", createCacheConfig(Duration.ofHours(2)));
        cacheConfigurations.put("showtimes", createCacheConfig(Duration.ofMinutes(30)));
        cacheConfigurations.put("cinemas", createCacheConfig(Duration.ofHours(24)));
        cacheConfigurations.put("users", createCacheConfig(Duration.ofMinutes(15)));
        
        return RedisCacheManager.builder(factory)
            .cacheDefaults(createCacheConfig(Duration.ofMinutes(10)))
            .withInitialCacheConfigurations(cacheConfigurations)
            .build();
    }
    
    private RedisCacheConfiguration createCacheConfig(Duration ttl) {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(ttl)
            .serializeKeysWith(...)
            .serializeValuesWith(...);
    }
}
```

**Timeline:** 1 day  
**Priority:** 🟢 MEDIUM

---

## 5️⃣ MONITORING & OBSERVABILITY

### 5.1 Spring Boot Actuator

**Implementation:**

#### Add Dependency
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

#### Configuration
```properties
# Actuator endpoints
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when-authorized
management.metrics.export.prometheus.enabled=true

# Custom metrics
management.metrics.tags.application=${spring.application.name}
management.metrics.tags.environment=${spring.profiles.active:dev}
```

#### Custom Metrics
```java
@Component
public class BookingMetrics {
    
    private final Counter bookingCreatedCounter;
    private final Counter bookingConfirmedCounter;
    private final Timer bookingCreationTimer;
    
    public BookingMetrics(MeterRegistry registry) {
        this.bookingCreatedCounter = Counter.builder("bookings.created")
            .description("Total bookings created")
            .register(registry);
            
        this.bookingConfirmedCounter = Counter.builder("bookings.confirmed")
            .description("Total bookings confirmed")
            .register(registry);
            
        this.bookingCreationTimer = Timer.builder("bookings.creation.time")
            .description("Booking creation time")
            .register(registry);
    }
    
    public void recordBookingCreated() {
        bookingCreatedCounter.increment();
    }
}
```

**Timeline:** 2 days  
**Priority:** 🟡 HIGH

---

### 5.2 Structured Logging

**Implementation:**

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"app":"hotcinemas"}</customFields>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="JSON"/>
    </root>
</configuration>
```

**Timeline:** 1 day  
**Priority:** 🟢 MEDIUM

---

## 6️⃣ API VERSIONING

**Recommended Approach:** URI Versioning

**Implementation:**

```java
// Move all controllers to /api/v1
@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {
    // ...
}

// Create ApiVersionConfig
@Configuration
public class ApiVersionConfig {
    public static final String API_V1 = "/api/v1";
    public static final String API_V2 = "/api/v2";  // Future
}

// Update SecurityConfig
private final String[] PUBLIC_ENDPOINTS = {
    "/api/v1/auth/**",
    "/api/v1/movies/**",  // Public movie browsing
    // ...
};
```

**Timeline:** 1 day  
**Priority:** 🟡 HIGH

---

## 7️⃣ ERROR HANDLING ENHANCEMENTS

**Missing Exception Handlers:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // ...existing handlers...
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.CONFLICT.value())
            .error("Data Integrity Violation")
            .message("Duplicate or invalid data")
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex) {
        Map<String, String> errors = ex.getConstraintViolations().stream()
            .collect(Collectors.toMap(
                violation -> violation.getPropertyPath().toString(),
                ConstraintViolation::getMessage
            ));
            
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation Failed")
            .message("Invalid request parameters")
            .fieldErrors(errors)
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Malformed JSON")
            .message("Invalid JSON format in request body")
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.FORBIDDEN.value())
            .error("Access Denied")
            .message("You don't have permission to access this resource")
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
}
```

**Timeline:** 1 day  
**Priority:** 🔴 CRITICAL

---

## 8️⃣ DEPLOYMENT RECOMMENDATIONS

### 8.1 Environment Profiles

**Create Profile-Specific Configurations:**

```
application.properties        # Common config
application-dev.properties   # Development
application-staging.properties  # Staging
application-prod.properties   # Production
```

**Production Configuration:**
```properties
# application-prod.properties

# Database
spring.datasource.url=${DB_URL}
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Redis
spring.data.redis.host=${REDIS_HOST}
spring.data.redis.password=${REDIS_PASSWORD}
spring.data.redis.ssl=true

# Logging
logging.level.root=WARN
logging.level.com.example.hotcinemas_be=INFO

# Actuator
management.endpoints.web.exposure.include=health,metrics,prometheus
management.endpoint.health.show-details=never

# Security
server.ssl.enabled=true
```

**Timeline:** 2 days  
**Priority:** 🔴 CRITICAL

---

### 8.2 Docker Configuration

**Create Dockerfile:**

```dockerfile
# Multi-stage build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Add non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Docker Compose for Local Dev:**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: hotcinemas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/hotcinemas
      DB_USERNAME: postgres
      DB_PASSWORD: postgres
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

**Timeline:** 1 day  
**Priority:** 🟡 HIGH

---

## 9️⃣ CI/CD PIPELINE

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
          
      - name: Run tests
        run: ./mvnw test
        
      - name: Run integration tests
        run: ./mvnw verify
        
      - name: SonarQube Scan
        run: ./mvnw sonar:sonar
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t hotcinemas-backend:${{ github.sha }} .
        
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push hotcinemas-backend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Your deployment script here
          kubectl set image deployment/hotcinemas-backend hotcinemas-backend=hotcinemas-backend:${{ github.sha }}
```

**Timeline:** 2-3 days  
**Priority:** 🟢 MEDIUM

---

## 🔟 PRIORITY IMPLEMENTATION ROADMAP

### Week 1-2: Critical Security & Stability
1. ✅ Permission data initialization
2. ✅ Method-level authorization
3. ✅ Flyway migration setup
4. ✅ Critical exception handling
5. ✅ Rate limiting

### Week 3-4: Testing & Quality
1. ✅ Unit tests (core services)
2. ✅ Integration tests
3. ✅ Database indexing
4. ✅ Query optimization
5. ✅ Security headers

### Week 5-6: Monitoring & Deployment
1. ✅ Actuator & Prometheus
2. ✅ Structured logging
3. ✅ Environment profiles
4. ✅ Docker configuration
5. ✅ API versioning

### Week 7-8: Production Readiness
1. ✅ CI/CD pipeline
2. ✅ Load testing
3. ✅ Security audit
4. ✅ Performance tuning
5. ✅ Documentation update

---

## 📊 ESTIMATED EFFORT

| Phase | Duration | Team Size | Priority |
|-------|----------|-----------|----------|
| Security Fixes | 1 week | 1-2 dev | 🔴 CRITICAL |
| Testing | 2-3 weeks | 2 dev | 🔴 CRITICAL |
| Database Migration | 1 week | 1 dev | 🔴 CRITICAL |
| Performance Optimization | 1 week | 1 dev | 🟡 HIGH |
| Monitoring Setup | 3-4 days | 1 dev | 🟡 HIGH |
| CI/CD Pipeline | 2-3 days | 1 DevOps | 🟢 MEDIUM |
| **Total** | **6-8 weeks** | **2-3 people** | |

---

## ✅ SUCCESS CRITERIA

### Before Production Launch:
- [ ] All critical security issues resolved
- [ ] 80%+ test coverage
- [ ] All database migrations tested
- [ ] Performance benchmarks met (response time < 200ms)
- [ ] Security audit passed
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Monitoring and alerting active
- [ ] Documentation complete
- [ ] Rollback plan tested
- [ ] DR plan documented

---

**Document Version:** 1.0  
**Last Updated:** December 30, 2025  
**Next Review:** January 15, 2026

