ALTER TABLE booking_seats
    DROP INDEX uc_booking_seats_showtime_seat;

CREATE INDEX idx_booking_seats_showtime_seat
    ON booking_seats (showtime_seat_id);
