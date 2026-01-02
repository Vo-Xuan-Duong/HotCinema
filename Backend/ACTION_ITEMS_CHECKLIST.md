# HOTCINEMAS BACKEND - ACTION ITEMS CHECKLIST

## 🔴 CRITICAL PRIORITY (Must Fix Before Production)

### Security & Authorization
- [ ] **Khởi tạo Permission Data**
  - [ ] Tạo script SQL insert 120 permissions vào database
  - [ ] Tạo script gán permissions cho Admin role
  - [ ] Tạo script gán permissions cho Staff role  
  - [ ] Tạo script gán permissions cho User role
  - [ ] Update AppInitConfig để auto-run scripts

- [ ] **Implement Method-Level Authorization**
  - [ ] Add @PreAuthorize to UserController methods
  - [ ] Add @PreAuthorize to MovieController methods
  - [ ] Add @PreAuthorize to BookingController methods
  - [ ] Add @PreAuthorize to PaymentController methods
  - [ ] Add @PreAuthorize to CinemaController methods
  - [ ] Add @PreAuthorize to TheaterController methods
  - [ ] Add @PreAuthorize to ShowtimeController methods
  - [ ] Add @PreAuthorize to SeatController methods
  - [ ] Add @PreAuthorize to GenreController methods
  - [ ] Add @PreAuthorize to ReviewController methods
  - [ ] Add @PreAuthorize to PromotionController methods
  - [ ] Add @PreAuthorize to RoleController methods
  - [ ] Add @PreAuthorize to PermissionController methods
  - [ ] Add @PreAuthorize to RegionController methods
  - [ ] Add @PreAuthorize to RevenueController methods
  - [ ] Add @PreAuthorize to CacheController methods

- [ ] **Update SecurityConfig**
  - [ ] Change .anyRequest().permitAll() to .anyRequest().authenticated()
  - [ ] Enable @EnableGlobalMethodSecurity
  - [ ] Configure proper PUBLIC_ENDPOINTS list
  - [ ] Test authentication flow

### Database Migration
- [ ] **Migrate from ddl-auto to Flyway**
  - [ ] Add Flyway dependency
  - [ ] Create V1__init_schema.sql
  - [ ] Create V2__init_permissions.sql
  - [ ] Create V3__init_roles_permissions.sql
  - [ ] Test migration on fresh database
  - [ ] Update application.properties

### Testing
- [ ] **Unit Tests - Services (Priority)**
  - [ ] UserService tests
  - [ ] AuthService tests
  - [ ] BookingService tests
  - [ ] PaymentService tests
  - [ ] ShowtimeService tests
  - [ ] MovieService tests

- [ ] **Integration Tests - Controllers**
  - [ ] AuthController tests
  - [ ] UserController tests
  - [ ] BookingController tests
  - [ ] PaymentController tests

- [ ] **Security Tests**
  - [ ] Test JWT authentication flow
  - [ ] Test authorization with different roles
  - [ ] Test protected endpoints
  - [ ] Test public endpoints

### Error Handling
- [ ] Add ConstraintViolationException handler
- [ ] Add DataIntegrityViolationException handler
- [ ] Add HttpMessageNotReadableException handler
- [ ] Add AccessDeniedException handler
- [ ] Complete all ErrorCode messages
- [ ] Test all error scenarios

---

## 🟡 HIGH PRIORITY (Should Have)

### Features Completion
- [ ] **Email Automation**
  - [ ] Auto-send booking confirmation email after payment success
  - [ ] Auto-send payment receipt
  - [ ] Email queue management
  - [ ] Email template management system

- [ ] **Booking Enhancement**
  - [ ] Implement booking cancellation flow
  - [ ] Add cancellation policy rules
  - [ ] Booking modification feature
  - [ ] Auto-cancel expired bookings job
  - [ ] Extend seat lock time API

- [ ] **Payment Enhancement**
  - [ ] Complete VNPay integration
  - [ ] Implement refund mechanism
  - [ ] Payment retry logic
  - [ ] Payment webhook security validation
  - [ ] PDF receipt generation

- [ ] **QR Code & Tickets**
  - [ ] QR code generation for booking
  - [ ] QR code validation API
  - [ ] PDF ticket with QR code
  - [ ] Email ticket attachment

### Performance & Optimization
- [ ] **Database Optimization**
  - [ ] Add indexes on foreign keys
  - [ ] Add index on booking_code
  - [ ] Add index on user.email
  - [ ] Add composite indexes for common queries
  - [ ] Optimize N+1 queries
  - [ ] Add database query logging in dev

- [ ] **Caching Optimization**
  - [ ] Review cache TTL values
  - [ ] Add caching to more endpoints
  - [ ] Implement cache warming
  - [ ] Cache statistics endpoint

### Security Enhancements
- [ ] **Add Rate Limiting**
  - [ ] Add Bucket4j dependency
  - [ ] Configure rate limits per endpoint
  - [ ] Rate limit by IP address
  - [ ] Rate limit by user
  - [ ] Rate limit error responses

- [ ] **Security Headers**
  - [ ] Add HSTS header
  - [ ] Add X-Frame-Options
  - [ ] Add X-Content-Type-Options
  - [ ] Add CSP header
  - [ ] Add X-XSS-Protection

- [ ] **Additional Security**
  - [ ] Account lockout after failed logins
  - [ ] Email verification on registration
  - [ ] Password strength validation
  - [ ] Session management improvements

### API Improvements
- [ ] **API Versioning**
  - [ ] Implement versioning strategy (URI or Header)
  - [ ] Create /api/v1 structure
  - [ ] Prepare for v2 migration path
  - [ ] Version in response headers

- [ ] **Documentation**
  - [ ] Add Javadoc to all public methods
  - [ ] Create API usage guide
  - [ ] Create developer onboarding guide
  - [ ] Create deployment guide

---

## 🟢 MEDIUM PRIORITY (Nice to Have)

### Advanced Features
- [ ] **User Management**
  - [ ] Email verification flow
  - [ ] User preferences management
  - [ ] Notification settings
  - [ ] User activity tracking
  - [ ] Membership tier implementation

- [ ] **Promotion System**
  - [ ] User-specific promotions
  - [ ] Automatic promotion application
  - [ ] Flash sales/time-limited offers
  - [ ] Loyalty points system
  - [ ] Referral program

- [ ] **Review System**
  - [ ] Review moderation system
  - [ ] Review helpful votes
  - [ ] Review replies
  - [ ] Verify purchase before review
  - [ ] Review images upload

- [ ] **Analytics Enhancement**
  - [ ] Export reports to PDF
  - [ ] Export reports to Excel
  - [ ] Revenue forecasting
  - [ ] Customer demographics
  - [ ] Occupancy rate analytics
  - [ ] Time-of-day analytics

### Development Tools
- [ ] **Code Quality**
  - [ ] Setup SonarQube
  - [ ] Fix code smells
  - [ ] Improve test coverage to 80%
  - [ ] Add code formatter configuration
  - [ ] Add pre-commit hooks

- [ ] **Monitoring Setup**
  - [ ] Add Actuator endpoints
  - [ ] Configure Prometheus metrics
  - [ ] Setup Grafana dashboards
  - [ ] Add custom metrics
  - [ ] Health check improvements

- [ ] **Logging Enhancement**
  - [ ] Centralized logging (ELK Stack)
  - [ ] Structured logging (JSON format)
  - [ ] Log correlation IDs
  - [ ] Performance logging
  - [ ] Audit logging completion

---

## 🔵 LOW PRIORITY (Future Enhancements)

### Business Features
- [ ] Movie recommendation engine
- [ ] Social media integration
- [ ] Push notifications
- [ ] Customer support chat
- [ ] Mobile app optimizations
- [ ] Theater occupancy heatmap
- [ ] Seat map visualization API
- [ ] Gift cards/vouchers
- [ ] Group booking management
- [ ] Corporate booking API

### Infrastructure
- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions workflow
  - [ ] Automated testing
  - [ ] Automated deployment
  - [ ] Environment management
  - [ ] Rollback strategy

- [ ] **Containerization**
  - [ ] Create Dockerfile
  - [ ] Docker Compose for local dev
  - [ ] Multi-stage builds
  - [ ] Image optimization

- [ ] **Kubernetes**
  - [ ] Create K8s manifests
  - [ ] ConfigMaps and Secrets
  - [ ] Horizontal Pod Autoscaling
  - [ ] Ingress configuration
  - [ ] Helm charts

- [ ] **Backup & DR**
  - [ ] Database backup strategy
  - [ ] Automated backups
  - [ ] Disaster recovery plan
  - [ ] Data restoration testing

---

## 📊 TRACKING

### Phase 1: Security & Stability (Week 1-2)
**Target Completion:** Week 2
- [ ] All CRITICAL items completed
- [ ] Basic tests written
- [ ] Security audit passed

### Phase 2: Features & Quality (Week 3-4)
**Target Completion:** Week 4
- [ ] All HIGH PRIORITY items completed
- [ ] 80% test coverage
- [ ] Performance benchmarks met

### Phase 3: Production Prep (Week 5-6)
**Target Completion:** Week 6
- [ ] All MEDIUM PRIORITY items completed
- [ ] CI/CD pipeline working
- [ ] Production environment ready

### Phase 4: Launch & Monitor (Week 7-8)
**Target Completion:** Week 8
- [ ] Production deployment
- [ ] Monitoring active
- [ ] Issue tracking system
- [ ] User feedback collection

---

## 📝 NOTES

### Code Review Checklist
- [ ] All new code has tests
- [ ] All new endpoints have @PreAuthorize
- [ ] All new methods have Javadoc
- [ ] All database changes have migration scripts
- [ ] All errors are properly handled
- [ ] All sensitive data is logged safely
- [ ] All DTOs are validated
- [ ] All transactions are properly managed

### Before Each Release
- [ ] Run all tests
- [ ] Run security scan
- [ ] Update API documentation
- [ ] Update CHANGELOG
- [ ] Create backup
- [ ] Test rollback procedure
- [ ] Update monitoring dashboards
- [ ] Notify stakeholders

---

**Last Updated:** December 30, 2025  
**Next Review:** January 6, 2026

