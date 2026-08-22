CREATE TABLE audit_logs
(
    id          BINARY(16)   NOT NULL,
    user_id     BINARY(16)   NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id   BINARY(16)   NULL,
    old_data    JSON NULL,
    new_data    JSON NULL,
    ip_address  VARCHAR(45) NULL,
    user_agent  TEXT NULL,
    created_at  datetime(6)  NOT NULL,
    CONSTRAINT pk_audit_logs PRIMARY KEY (id)
);

CREATE TABLE auditoriums
(
    id            BINARY(16)   NOT NULL,
    is_active     BIT(1)       NOT NULL,
    created_at    datetime(6)  NOT NULL,
    updated_at    datetime(6)  NOT NULL,
    cinema_id     BINARY(16)   NOT NULL,
    code          VARCHAR(50)  NOT NULL,
    name          VARCHAR(150) NOT NULL,
    screen_type   VARCHAR(30)  NOT NULL,
    total_rows    INT NULL,
    total_columns INT NULL,
    capacity      INT          NOT NULL,
    status        VARCHAR(30)  NOT NULL,
    deleted_at    datetime(6)  NULL,
    CONSTRAINT pk_auditoriums PRIMARY KEY (id)
);

CREATE TABLE booking_items
(
    id           BINARY(16)     NOT NULL,
    booking_id   BINARY(16)     NOT NULL,
    product_id   BINARY(16)     NULL,
    product_name VARCHAR(200)   NOT NULL,
    quantity     INT            NOT NULL,
    unit_price   DECIMAL(12, 2) NOT NULL,
    total_price  DECIMAL(12, 2) NOT NULL,
    created_at   datetime(6)    NOT NULL,
    CONSTRAINT pk_booking_items PRIMARY KEY (id)
);

CREATE TABLE booking_promotions
(
    id                BINARY(16)     NOT NULL,
    booking_id        BINARY(16)     NOT NULL,
    promotion_id      BINARY(16)     NULL,
    promotion_code_id BINARY(16)     NULL,
    discount_amount   DECIMAL(12, 2) NOT NULL,
    created_at        datetime(6)    NOT NULL,
    CONSTRAINT pk_booking_promotions PRIMARY KEY (id)
);

CREATE TABLE booking_seats
(
    id               BINARY(16)     NOT NULL,
    booking_id       BINARY(16)     NOT NULL,
    showtime_seat_id BINARY(16)     NOT NULL,
    seat_name        VARCHAR(30)    NOT NULL,
    seat_type_name   VARCHAR(100)   NOT NULL,
    unit_price       DECIMAL(12, 2) NOT NULL,
    created_at       datetime(6)    NOT NULL,
    CONSTRAINT pk_booking_seats PRIMARY KEY (id)
);

CREATE TABLE booking_status_history
(
    id          BINARY(16)  NOT NULL,
    booking_id  BINARY(16)  NOT NULL,
    from_status VARCHAR(30) NULL,
    to_status   VARCHAR(30) NOT NULL,
    changed_by  BINARY(16)  NULL,
    reason      TEXT NULL,
    created_at  datetime(6) NOT NULL,
    CONSTRAINT pk_booking_status_history PRIMARY KEY (id)
);

CREATE TABLE bookings
(
    id              BINARY(16)     NOT NULL,
    is_active       BIT(1)         NOT NULL,
    created_at      datetime(6)    NOT NULL,
    updated_at      datetime(6)    NOT NULL,
    booking_code    VARCHAR(50)    NOT NULL,
    user_id         BINARY(16)     NULL,
    showtime_id     BINARY(16)     NOT NULL,
    customer_name   VARCHAR(150)   NOT NULL,
    customer_email  VARCHAR(255) NULL,
    customer_phone  VARCHAR(30) NULL,
    status          VARCHAR(30)    NOT NULL,
    seat_amount     DECIMAL(12, 2) NOT NULL,
    food_amount     DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL,
    subtotal        DECIMAL(12, 2) NOT NULL,
    total_amount    DECIMAL(12, 2) NOT NULL,
    currency        VARCHAR(3)     NOT NULL,
    expires_at      datetime(6)    NULL,
    paid_at         datetime(6)    NULL,
    cancelled_at    datetime(6)    NULL,
    CONSTRAINT pk_bookings PRIMARY KEY (id)
);

CREATE TABLE cinema_products
(
    id             BINARY(16)     NOT NULL,
    is_active      BIT(1)         NOT NULL,
    created_at     datetime(6)    NOT NULL,
    updated_at     datetime(6)    NOT NULL,
    cinema_id      BINARY(16)     NOT NULL,
    product_id     BINARY(16)     NOT NULL,
    price          DECIMAL(12, 2) NOT NULL,
    stock_quantity INT NULL,
    is_available   BIT(1)         NOT NULL,
    CONSTRAINT pk_cinema_products PRIMARY KEY (id)
);

CREATE TABLE cinemas
(
    id            BINARY(16)     NOT NULL,
    is_active     BIT(1)       NOT NULL,
    created_at    datetime(6)    NOT NULL,
    updated_at    datetime(6)    NOT NULL,
    code          VARCHAR(50)  NOT NULL,
    name          VARCHAR(200) NOT NULL,
    address       VARCHAR(500) NOT NULL,
    ward          VARCHAR(150) NULL,
    district      VARCHAR(150) NULL,
    city          VARCHAR(150) NOT NULL,
    latitude      DECIMAL(10, 7) NULL,
    longitude     DECIMAL(10, 7) NULL,
    phone         VARCHAR(30) NULL,
    email         VARCHAR(255) NULL,
    `description` TEXT NULL,
    logo_url      TEXT NULL,
    status        VARCHAR(30)  NOT NULL,
    deleted_at    datetime(6)    NULL,
    CONSTRAINT pk_cinemas PRIMARY KEY (id)
);

CREATE TABLE employee_cinemas
(
    id          BINARY(16)  NOT NULL,
    user_id     BINARY(16)  NOT NULL,
    cinema_id   BINARY(16)  NOT NULL,
    position    VARCHAR(30) NOT NULL,
    is_active   BIT(1)      NOT NULL,
    assigned_at datetime(6) NOT NULL,
    ended_at    datetime(6) NULL,
    CONSTRAINT pk_employee_cinemas PRIMARY KEY (id)
);

CREATE TABLE genres
(
    id         BINARY(16)   NOT NULL,
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(120) NOT NULL,
    created_at datetime(6)  NOT NULL,
    CONSTRAINT pk_genres PRIMARY KEY (id)
);

CREATE TABLE movie_genres
(
    genre_id BINARY(16) NOT NULL,
    movie_id BINARY(16) NOT NULL,
    CONSTRAINT pk_movie_genres PRIMARY KEY (genre_id, movie_id)
);

CREATE TABLE movie_media
(
    id         BINARY(16)  NOT NULL,
    movie_id   BINARY(16)  NOT NULL,
    type       VARCHAR(30) NOT NULL,
    url        TEXT        NOT NULL,
    sort_order INT         NOT NULL,
    created_at datetime(6) NOT NULL,
    CONSTRAINT pk_movie_media PRIMARY KEY (id)
);

CREATE TABLE movies
(
    id                 BINARY(16)   NOT NULL,
    is_active          BIT(1)       NOT NULL,
    created_at         datetime(6)  NOT NULL,
    updated_at         datetime(6)  NOT NULL,
    title              VARCHAR(255) NOT NULL,
    original_title     VARCHAR(255) NULL,
    slug               VARCHAR(255) NOT NULL,
    `description`      TEXT NULL,
    duration_minutes   INT          NOT NULL,
    release_date       date NULL,
    end_date           date NULL,
    age_rating         VARCHAR(20) NULL,
    original_language  VARCHAR(100) NULL,
    director           VARCHAR(255) NULL,
    actors             TEXT NULL,
    country            VARCHAR(120) NULL,
    production_company VARCHAR(255) NULL,
    poster_url         TEXT NULL,
    banner_url         TEXT NULL,
    trailer_url        TEXT NULL,
    status             VARCHAR(30)  NOT NULL,
    deleted_at         datetime(6)  NULL,
    CONSTRAINT pk_movies PRIMARY KEY (id)
);

CREATE TABLE notifications
(
    id         BINARY(16)   NOT NULL,
    user_id    BINARY(16)   NOT NULL,
    type       VARCHAR(50)  NOT NULL,
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    is_read    BIT(1)       NOT NULL,
    read_at    datetime(6)  NULL,
    created_at datetime(6)  NOT NULL,
    CONSTRAINT pk_notifications PRIMARY KEY (id)
);

CREATE TABLE payment_transactions
(
    id                      BINARY(16)     NOT NULL,
    payment_id              BINARY(16)     NOT NULL,
    transaction_type        VARCHAR(30) NOT NULL,
    provider_transaction_id VARCHAR(255) NULL,
    amount                  DECIMAL(12, 2) NULL,
    status                  VARCHAR(30) NOT NULL,
    request_payload         JSON NULL,
    response_payload        JSON NULL,
    created_at              datetime(6)    NOT NULL,
    CONSTRAINT pk_payment_transactions PRIMARY KEY (id)
);

CREATE TABLE payment_webhooks
(
    id                BINARY(16)   NOT NULL,
    provider          VARCHAR(30) NOT NULL,
    external_event_id VARCHAR(255) NULL,
    payload           JSON        NOT NULL,
    signature         TEXT NULL,
    verified          BIT(1)      NOT NULL,
    processed         BIT(1)      NOT NULL,
    processed_at      datetime(6)  NULL,
    created_at        datetime(6)  NOT NULL,
    CONSTRAINT pk_payment_webhooks PRIMARY KEY (id)
);

CREATE TABLE payments
(
    id                      BINARY(16)     NOT NULL,
    is_active               BIT(1)         NOT NULL,
    created_at              datetime(6)    NOT NULL,
    updated_at              datetime(6)    NOT NULL,
    booking_id              BINARY(16)     NOT NULL,
    provider                VARCHAR(30)    NOT NULL,
    payment_method          VARCHAR(50) NULL,
    amount                  DECIMAL(12, 2) NOT NULL,
    currency                VARCHAR(3)     NOT NULL,
    status                  VARCHAR(30)    NOT NULL,
    idempotency_key         VARCHAR(150)   NOT NULL,
    provider_order_id       VARCHAR(255) NULL,
    provider_transaction_id VARCHAR(255) NULL,
    request_id              VARCHAR(255) NULL,
    payment_url             TEXT NULL,
    failure_code            VARCHAR(100) NULL,
    failure_message         TEXT NULL,
    paid_at                 datetime(6)    NULL,
    CONSTRAINT pk_payments PRIMARY KEY (id)
);

CREATE TABLE product_categories
(
    id         BINARY(16)   NOT NULL,
    code       VARCHAR(50)  NOT NULL,
    name       VARCHAR(120) NOT NULL,
    created_at datetime(6)  NOT NULL,
    CONSTRAINT pk_product_categories PRIMARY KEY (id)
);

CREATE TABLE products
(
    id            BINARY(16)   NOT NULL,
    is_active     BIT(1)       NOT NULL,
    created_at    datetime(6)  NOT NULL,
    updated_at    datetime(6)  NOT NULL,
    category_id   BINARY(16)   NOT NULL,
    code          VARCHAR(50)  NOT NULL,
    name          VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    image_url     TEXT NULL,
    status        VARCHAR(20)  NOT NULL,
    deleted_at    datetime(6)  NULL,
    CONSTRAINT pk_products PRIMARY KEY (id)
);

CREATE TABLE promotion_codes
(
    id           BINARY(16)   NOT NULL,
    promotion_id BINARY(16)   NOT NULL,
    code         VARCHAR(100) NOT NULL,
    usage_limit  INT NULL,
    used_count   INT          NOT NULL,
    active       BIT(1)       NOT NULL,
    created_at   datetime(6)  NOT NULL,
    CONSTRAINT pk_promotion_codes PRIMARY KEY (id)
);

CREATE TABLE promotions
(
    id                   BINARY(16)     NOT NULL,
    is_active            BIT(1)         NOT NULL,
    created_at           datetime(6)    NOT NULL,
    updated_at           datetime(6)    NOT NULL,
    name                 VARCHAR(200)   NOT NULL,
    `description`        TEXT NULL,
    discount_type        VARCHAR(30)    NOT NULL,
    discount_value       DECIMAL(12, 2) NOT NULL,
    max_discount_amount  DECIMAL(12, 2) NULL,
    minimum_order_amount DECIMAL(12, 2) NOT NULL,
    start_at             datetime(6)    NOT NULL,
    end_at               datetime(6)    NOT NULL,
    usage_limit          INT NULL,
    usage_per_user       INT NULL,
    status               VARCHAR(20)    NOT NULL,
    CONSTRAINT pk_promotions PRIMARY KEY (id)
);

CREATE TABLE refresh_tokens
(
    id         BINARY(16)   NOT NULL,
    user_id    BINARY(16)   NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at datetime(6)  NOT NULL,
    revoked_at datetime(6)  NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at datetime(6)  NOT NULL,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id)
);

CREATE TABLE roles
(
    id            BINARY(16)   NOT NULL,
    code          VARCHAR(50)  NOT NULL,
    name          VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    created_at    datetime(6)  NOT NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id)
);

CREATE TABLE seat_types
(
    id             BINARY(16)     NOT NULL,
    code           VARCHAR(30)    NOT NULL,
    name           VARCHAR(100)   NOT NULL,
    `description`  TEXT NULL,
    price_modifier DECIMAL(12, 2) NOT NULL,
    created_at     datetime(6)    NOT NULL,
    CONSTRAINT pk_seat_types PRIMARY KEY (id)
);

CREATE TABLE seats
(
    id            BINARY(16)  NOT NULL,
    is_active     BIT(1)      NOT NULL,
    created_at    datetime(6) NOT NULL,
    updated_at    datetime(6) NOT NULL,
    auditorium_id BINARY(16)  NOT NULL,
    seat_type_id  BINARY(16)  NOT NULL,
    row_label     VARCHAR(10) NOT NULL,
    seat_number   INT         NOT NULL,
    display_name  VARCHAR(30) NOT NULL,
    x_position    INT NULL,
    y_position    INT NULL,
    status        VARCHAR(30) NOT NULL,
    CONSTRAINT pk_seats PRIMARY KEY (id)
);

CREATE TABLE showtime_prices
(
    id           BINARY(16)     NOT NULL,
    showtime_id  BINARY(16)     NOT NULL,
    seat_type_id BINARY(16)     NOT NULL,
    price        DECIMAL(12, 2) NOT NULL,
    created_at   datetime(6)    NOT NULL,
    CONSTRAINT pk_showtime_prices PRIMARY KEY (id)
);

CREATE TABLE showtime_seats
(
    id              BINARY(16)     NOT NULL,
    is_active       BIT(1)         NOT NULL,
    created_at      datetime(6)    NOT NULL,
    updated_at      datetime(6)    NOT NULL,
    showtime_id     BINARY(16)     NOT NULL,
    seat_id         BINARY(16)     NOT NULL,
    price           DECIMAL(12, 2) NOT NULL,
    status          VARCHAR(20)    NOT NULL,
    held_by_user_id BINARY(16)     NULL,
    hold_token      BINARY(16)     NULL,
    held_at         datetime(6)    NULL,
    hold_expires_at datetime(6)    NULL,
    booking_id      BINARY(16)     NULL,
    version         BIGINT         NOT NULL,
    CONSTRAINT pk_showtime_seats PRIMARY KEY (id)
);

CREATE TABLE showtimes
(
    id               BINARY(16)     NOT NULL,
    is_active        BIT(1)         NOT NULL,
    created_at       datetime(6)    NOT NULL,
    updated_at       datetime(6)    NOT NULL,
    movie_id         BINARY(16)     NOT NULL,
    auditorium_id    BINARY(16)     NOT NULL,
    start_time       datetime(6)    NOT NULL,
    end_time         datetime(6)    NOT NULL,
    language         VARCHAR(100) NULL,
    subtitle         VARCHAR(100) NULL,
    format           VARCHAR(30)    NOT NULL,
    base_price       DECIMAL(12, 2) NOT NULL,
    booking_open_at  datetime(6)    NULL,
    booking_close_at datetime(6)    NULL,
    status           VARCHAR(30)    NOT NULL,
    created_by       BINARY(16)     NULL,
    CONSTRAINT pk_showtimes PRIMARY KEY (id)
);

CREATE TABLE ticket_scans
(
    id          BINARY(16)  NOT NULL,
    ticket_id   BINARY(16)  NULL,
    cinema_id   BINARY(16)  NULL,
    scanned_by  BINARY(16)  NULL,
    result      VARCHAR(30) NOT NULL,
    scanned_at  datetime(6) NOT NULL,
    device_info TEXT NULL,
    CONSTRAINT pk_ticket_scans PRIMARY KEY (id)
);

CREATE TABLE tickets
(
    id              BINARY(16)  NOT NULL,
    is_active       BIT(1)      NOT NULL,
    created_at      datetime(6) NOT NULL,
    updated_at      datetime(6) NOT NULL,
    ticket_code     VARCHAR(80) NOT NULL,
    booking_id      BINARY(16)  NOT NULL,
    booking_seat_id BINARY(16)  NOT NULL,
    qr_token        BINARY(16)  NOT NULL,
    status          VARCHAR(20) NOT NULL,
    issued_at       datetime(6) NOT NULL,
    checked_in_at   datetime(6) NULL,
    checked_in_by   BINARY(16)  NULL,
    CONSTRAINT pk_tickets PRIMARY KEY (id)
);

CREATE TABLE user_roles
(
    role_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (role_id, user_id)
);

CREATE TABLE users
(
    id             BINARY(16)   NOT NULL,
    is_active      BIT(1)       NOT NULL,
    created_at     datetime(6)  NOT NULL,
    updated_at     datetime(6)  NOT NULL,
    email          VARCHAR(255) NULL,
    phone          VARCHAR(30) NULL,
    password_hash  VARCHAR(255) NULL,
    full_name      VARCHAR(150) NOT NULL,
    date_of_birth  date NULL,
    gender         VARCHAR(20) NULL,
    avatar_url     TEXT NULL,
    status         VARCHAR(30)  NOT NULL,
    email_verified BIT(1)       NOT NULL,
    phone_verified BIT(1)       NOT NULL,
    last_login_at  datetime(6)  NULL,
    deleted_at     datetime(6)  NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE booking_seats
    ADD CONSTRAINT uc_booking_seats_showtime_seat UNIQUE (showtime_seat_id);

ALTER TABLE bookings
    ADD CONSTRAINT uc_bookings_booking_code UNIQUE (booking_code);

ALTER TABLE cinemas
    ADD CONSTRAINT uc_cinemas_code UNIQUE (code);

ALTER TABLE genres
    ADD CONSTRAINT uc_genres_name UNIQUE (name);

ALTER TABLE genres
    ADD CONSTRAINT uc_genres_slug UNIQUE (slug);

ALTER TABLE movies
    ADD CONSTRAINT uc_movies_slug UNIQUE (slug);

ALTER TABLE payments
    ADD CONSTRAINT uc_payments_idempotency_key UNIQUE (idempotency_key);

ALTER TABLE product_categories
    ADD CONSTRAINT uc_product_categories_code UNIQUE (code);

ALTER TABLE products
    ADD CONSTRAINT uc_products_code UNIQUE (code);

ALTER TABLE promotion_codes
    ADD CONSTRAINT uc_promotion_codes_code UNIQUE (code);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT uc_refresh_tokens_token_hash UNIQUE (token_hash);

ALTER TABLE roles
    ADD CONSTRAINT uc_roles_code UNIQUE (code);

ALTER TABLE seat_types
    ADD CONSTRAINT uc_seat_types_code UNIQUE (code);

ALTER TABLE tickets
    ADD CONSTRAINT uc_tickets_booking_seat UNIQUE (booking_seat_id);

ALTER TABLE tickets
    ADD CONSTRAINT uc_tickets_qr_token UNIQUE (qr_token);

ALTER TABLE tickets
    ADD CONSTRAINT uc_tickets_ticket_code UNIQUE (ticket_code);

ALTER TABLE auditoriums
    ADD CONSTRAINT FK_AUDITORIUMS_ON_CINEMA FOREIGN KEY (cinema_id) REFERENCES cinemas (id);

ALTER TABLE audit_logs
    ADD CONSTRAINT FK_AUDIT_LOGS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE bookings
    ADD CONSTRAINT FK_BOOKINGS_ON_SHOWTIME FOREIGN KEY (showtime_id) REFERENCES showtimes (id);

ALTER TABLE bookings
    ADD CONSTRAINT FK_BOOKINGS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE booking_items
    ADD CONSTRAINT FK_BOOKING_ITEMS_ON_BOOKING FOREIGN KEY (booking_id) REFERENCES bookings (id);

ALTER TABLE booking_items
    ADD CONSTRAINT FK_BOOKING_ITEMS_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE booking_promotions
    ADD CONSTRAINT FK_BOOKING_PROMOTIONS_ON_BOOKING FOREIGN KEY (booking_id) REFERENCES bookings (id);

ALTER TABLE booking_promotions
    ADD CONSTRAINT FK_BOOKING_PROMOTIONS_ON_PROMOTION FOREIGN KEY (promotion_id) REFERENCES promotions (id);

ALTER TABLE booking_promotions
    ADD CONSTRAINT FK_BOOKING_PROMOTIONS_ON_PROMOTION_CODE FOREIGN KEY (promotion_code_id) REFERENCES promotion_codes (id);

ALTER TABLE booking_seats
    ADD CONSTRAINT FK_BOOKING_SEATS_ON_BOOKING FOREIGN KEY (booking_id) REFERENCES bookings (id);

ALTER TABLE booking_seats
    ADD CONSTRAINT FK_BOOKING_SEATS_ON_SHOWTIME_SEAT FOREIGN KEY (showtime_seat_id) REFERENCES showtime_seats (id);

ALTER TABLE booking_status_history
    ADD CONSTRAINT FK_BOOKING_STATUS_HISTORY_ON_BOOKING FOREIGN KEY (booking_id) REFERENCES bookings (id);

ALTER TABLE booking_status_history
    ADD CONSTRAINT FK_BOOKING_STATUS_HISTORY_ON_CHANGED_BY FOREIGN KEY (changed_by) REFERENCES users (id);

ALTER TABLE cinema_products
    ADD CONSTRAINT FK_CINEMA_PRODUCTS_ON_CINEMA FOREIGN KEY (cinema_id) REFERENCES cinemas (id);

ALTER TABLE cinema_products
    ADD CONSTRAINT FK_CINEMA_PRODUCTS_ON_PRODUCT FOREIGN KEY (product_id) REFERENCES products (id);

ALTER TABLE employee_cinemas
    ADD CONSTRAINT FK_EMPLOYEE_CINEMAS_ON_CINEMA FOREIGN KEY (cinema_id) REFERENCES cinemas (id);

ALTER TABLE employee_cinemas
    ADD CONSTRAINT FK_EMPLOYEE_CINEMAS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE movie_media
    ADD CONSTRAINT FK_MOVIE_MEDIA_ON_MOVIE FOREIGN KEY (movie_id) REFERENCES movies (id);

ALTER TABLE notifications
    ADD CONSTRAINT FK_NOTIFICATIONS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE payments
    ADD CONSTRAINT FK_PAYMENTS_ON_BOOKING FOREIGN KEY (booking_id) REFERENCES bookings (id);

ALTER TABLE payment_transactions
    ADD CONSTRAINT FK_PAYMENT_TRANSACTIONS_ON_PAYMENT FOREIGN KEY (payment_id) REFERENCES payments (id);

ALTER TABLE products
    ADD CONSTRAINT FK_PRODUCTS_ON_CATEGORY FOREIGN KEY (category_id) REFERENCES product_categories (id);

ALTER TABLE promotion_codes
    ADD CONSTRAINT FK_PROMOTION_CODES_ON_PROMOTION FOREIGN KEY (promotion_id) REFERENCES promotions (id);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT FK_REFRESH_TOKENS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE seats
    ADD CONSTRAINT FK_SEATS_ON_AUDITORIUM FOREIGN KEY (auditorium_id) REFERENCES auditoriums (id);

ALTER TABLE seats
    ADD CONSTRAINT FK_SEATS_ON_SEAT_TYPE FOREIGN KEY (seat_type_id) REFERENCES seat_types (id);

ALTER TABLE showtimes
    ADD CONSTRAINT FK_SHOWTIMES_ON_AUDITORIUM FOREIGN KEY (auditorium_id) REFERENCES auditoriums (id);

ALTER TABLE showtimes
    ADD CONSTRAINT FK_SHOWTIMES_ON_CREATED_BY FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE showtimes
    ADD CONSTRAINT FK_SHOWTIMES_ON_MOVIE FOREIGN KEY (movie_id) REFERENCES movies (id);

ALTER TABLE showtime_prices
    ADD CONSTRAINT FK_SHOWTIME_PRICES_ON_SEAT_TYPE FOREIGN KEY (seat_type_id) REFERENCES seat_types (id);

ALTER TABLE showtime_prices
    ADD CONSTRAINT FK_SHOWTIME_PRICES_ON_SHOWTIME FOREIGN KEY (showtime_id) REFERENCES showtimes (id);

ALTER TABLE showtime_seats
    ADD CONSTRAINT FK_SHOWTIME_SEATS_ON_BOOKING FOREIGN KEY (booking_id) REFERENCES bookings (id);

ALTER TABLE showtime_seats
    ADD CONSTRAINT FK_SHOWTIME_SEATS_ON_HELD_BY_USER FOREIGN KEY (held_by_user_id) REFERENCES users (id);

ALTER TABLE showtime_seats
    ADD CONSTRAINT FK_SHOWTIME_SEATS_ON_SEAT FOREIGN KEY (seat_id) REFERENCES seats (id);

ALTER TABLE showtime_seats
    ADD CONSTRAINT FK_SHOWTIME_SEATS_ON_SHOWTIME FOREIGN KEY (showtime_id) REFERENCES showtimes (id);

ALTER TABLE tickets
    ADD CONSTRAINT FK_TICKETS_ON_BOOKING FOREIGN KEY (booking_id) REFERENCES bookings (id);

ALTER TABLE tickets
    ADD CONSTRAINT FK_TICKETS_ON_BOOKING_SEAT FOREIGN KEY (booking_seat_id) REFERENCES booking_seats (id);

ALTER TABLE tickets
    ADD CONSTRAINT FK_TICKETS_ON_CHECKED_IN_BY FOREIGN KEY (checked_in_by) REFERENCES users (id);

ALTER TABLE ticket_scans
    ADD CONSTRAINT FK_TICKET_SCANS_ON_CINEMA FOREIGN KEY (cinema_id) REFERENCES cinemas (id);

ALTER TABLE ticket_scans
    ADD CONSTRAINT FK_TICKET_SCANS_ON_SCANNED_BY FOREIGN KEY (scanned_by) REFERENCES users (id);

ALTER TABLE ticket_scans
    ADD CONSTRAINT FK_TICKET_SCANS_ON_TICKET FOREIGN KEY (ticket_id) REFERENCES tickets (id);

ALTER TABLE movie_genres
    ADD CONSTRAINT fk_movgen_on_genre FOREIGN KEY (genre_id) REFERENCES genres (id);

ALTER TABLE movie_genres
    ADD CONSTRAINT fk_movgen_on_movie FOREIGN KEY (movie_id) REFERENCES movies (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_userol_on_role FOREIGN KEY (role_id) REFERENCES roles (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_userol_on_user FOREIGN KEY (user_id) REFERENCES users (id);
