CREATE UNIQUE INDEX uk_payment_webhooks_provider_external_event
    ON payment_webhooks (provider, external_event_id);

CREATE INDEX idx_showtime_seats_hold_expiry
    ON showtime_seats (status, hold_expires_at, is_active);

CREATE INDEX idx_payments_provider_order
    ON payments (provider, provider_order_id, is_active);

CREATE INDEX idx_employee_cinemas_user_cinema_active
    ON employee_cinemas (user_id, cinema_id, is_active);
