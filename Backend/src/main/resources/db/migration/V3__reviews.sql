CREATE TABLE reviews
(
    id          BINARY(16)  NOT NULL,
    is_active   BIT(1)      NOT NULL,
    created_at  datetime(6) NOT NULL,
    updated_at  datetime(6) NOT NULL,
    movie_id    BINARY(16)  NOT NULL,
    user_id     BINARY(16)  NOT NULL,
    parent_id   BINARY(16)  NULL,
    rating      INT         NOT NULL,
    review_text TEXT        NOT NULL,
    status      VARCHAR(30) NOT NULL,
    CONSTRAINT pk_reviews PRIMARY KEY (id),
    CONSTRAINT fk_reviews_movie FOREIGN KEY (movie_id) REFERENCES movies (id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_reviews_parent FOREIGN KEY (parent_id) REFERENCES reviews (id)
);

CREATE INDEX idx_reviews_movie_status_created
    ON reviews (movie_id, status, created_at);

CREATE INDEX idx_reviews_user_created
    ON reviews (user_id, created_at);

CREATE INDEX idx_reviews_parent_created
    ON reviews (parent_id, created_at);
