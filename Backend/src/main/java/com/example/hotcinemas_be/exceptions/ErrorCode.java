package com.example.hotcinemas_be.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // COMMON / SYSTEM
    UNCATEGORIZED(HttpStatus.INTERNAL_SERVER_ERROR, "Error Unauthorized Access"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Invalid request"),
    NOT_IMPLEMENTED(HttpStatus.NOT_IMPLEMENTED, "Not implemented"),
    SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "Service unavailable"),
    DATABASE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Database error"),
    REDIS_OPERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Redis operation failed"),
    DEPENDENCY_FAILURE(HttpStatus.FAILED_DEPENDENCY, "Downstream dependency failure"),
    REQUEST_TIMEOUT(HttpStatus.REQUEST_TIMEOUT, "Request timeout"),
    JSON_PARSE(HttpStatus.BAD_REQUEST, "Malformed JSON request"),
    MEDIA_TYPE_NOT_SUPPORTED(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "Method not allowed"),
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "Too many requests"),

    // AUTH / SECURITY
    BAD_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Bad credentials"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token expired"),
    TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "Token not found"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid token"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized access"),
    AUTHENTICATION_REQUIRED(HttpStatus.UNAUTHORIZED, "Authentication required"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Access denied"),
    FORBIDDEN_OPERATION(HttpStatus.FORBIDDEN, "Forbidden operation"),
    REFRESH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Refresh token expired"),
    REFRESH_TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, "Refresh token revoked"),

    // ACCOUNT / USER
    REGISTRATION_FAILED(HttpStatus.BAD_REQUEST, "Registration failed"),
    ACCOUNT_INACTIVE(HttpStatus.FORBIDDEN, "Account is inactive"),
    ACCOUNT_LOCKED(HttpStatus.LOCKED, "Account is locked"),
    PASSWORD_NOT_MATCH(HttpStatus.BAD_REQUEST, "Password does not match"),
    CONFIRM_PASSWORD_AND_PASSWORD_NOT_MATCH(HttpStatus.BAD_REQUEST, "Confirm password and password does not match"),
    PASSWORD_WEAK(HttpStatus.BAD_REQUEST, "Weak password"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email already exists"),
    USER_ALREADY_ACTIVE(HttpStatus.BAD_REQUEST, "User is already active"),
    USER_ALREADY_INACTIVE(HttpStatus.BAD_REQUEST, "User is already inactive"),

    // VALIDATION / OPERATION
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Validation failed"),
    INVALID_OPERATION(HttpStatus.BAD_REQUEST, "Invalid operation"),

    // PERMISSION / ROLE
    PERMISSION_NOT_FOUND(HttpStatus.NOT_FOUND, "Permission not found"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "Role not found"),

    // RESOURCE NOT FOUND (DOMAIN)
    MODEL_NOT_FOUND(HttpStatus.NOT_FOUND, "Model not found"),
    MOVIE_NOT_FOUND(HttpStatus.NOT_FOUND, "Movie not found"),
    MOVIE_CONFLICT(HttpStatus.CONFLICT, "Movie conflict"),
    CINEMA_NOT_FOUND(HttpStatus.NOT_FOUND, "Cinema not found"),
    CINEMA_CLUSTER_NOT_FOUND(HttpStatus.NOT_FOUND, "Cinema cluster not found"),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "Room not found"),
    SEAT_NOT_FOUND(HttpStatus.NOT_FOUND, "Seat not found"),
    SHOWTIME_NOT_FOUND(HttpStatus.NOT_FOUND, "Showtime not found"),
    SHOWTIME_CONFLICT(HttpStatus.CONFLICT, "Showtime overlaps with an existing showtime in the same room"),
    BOOKING_NOT_FOUND(HttpStatus.NOT_FOUND, "Booking not found"),
    TICKET_NOT_FOUND(HttpStatus.NOT_FOUND, "Ticket not found"),
    VOUCHER_NOT_FOUND(HttpStatus.NOT_FOUND, "Voucher not found"),
    GENRE_NOT_FOUND(HttpStatus.NOT_FOUND, "Genre not found"),
    REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "Review not found"),
    USER_ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "UserRole not found"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    PROMOTION_NOT_FOUND(HttpStatus.NOT_FOUND, "Promotion not found"),
    PROMOTION_INVALID(HttpStatus.BAD_REQUEST, "Promotion is invalid"),

    // RESOURCE CONFLICT / DUPLICATE
    MODEL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Model already exists"),
    ROLE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Role already exists"),
    RESOURCE_CONFLICT(HttpStatus.CONFLICT, "Resource conflict"),
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "Duplicate resource"),
    CITY_NAME_ALREADY_EXISTS(HttpStatus.CONFLICT, "City name already exists"),
    CITY_CODE_ALREADY_EXISTS(HttpStatus.CONFLICT, "City code already exists"),
    DISTRICT_NAME_ALREADY_EXISTS(HttpStatus.CONFLICT, "District name already exists in this city"),
    PROMOTION_ALREADY_EXISTS(HttpStatus.CONFLICT, "Promotion code already exists"),

    // FILE / MEDIA
    FILE_UPLOAD_FAILED(HttpStatus.BAD_REQUEST, "File upload failed"),
    CLOUDINARY_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary upload failed"),

    // BOOKING / PAYMENT / VOUCHER / SEAT LOCK
    PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "Payment failed"),
    VOUCHER_INVALID(HttpStatus.BAD_REQUEST, "Voucher không hợp lệ"),
    VOUCHER_OUT_OF_STOCK(HttpStatus.BAD_REQUEST, "Voucher đã hết lượt hoặc hết hạn"),
    SEAT_ALREADY_LOCKED(HttpStatus.CONFLICT, "Ghế đang được giữ bởi người dùng khác"),


    SEAT_NOT_LOCKED_BY_USER(HttpStatus.BAD_REQUEST, "Ghế không được giữ bởi người dùng"),;


    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }

}
