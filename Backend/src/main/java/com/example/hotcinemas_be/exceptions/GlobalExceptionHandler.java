package com.example.hotcinemas_be.exceptions;

import java.time.LocalDateTime;

import com.example.hotcinemas_be.dtos.common.ErrorResponse;
import com.example.hotcinemas_be.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final EmailService emailService;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        log.error("Validation exception at [{} {}] - errors: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());

        String errorMessages = ex.getBindingResult().getAllErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .reduce("", (msg1, msg2) -> msg1 + "; " + msg2);

        emailService.sendMailToAdmin("Lỗi hệ thống", "Có lỗi Validation xảy ra: " + errorMessages);

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message(errorMessages)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex, HttpServletRequest request) {
        log.error("Runtime exception at [{} {}]: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(),
                ex);

        emailService.sendMailToAdmin("Lỗi hệ thống", "Có lỗi RuntimeException xảy ra: " + ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("RUNTIME_EXCEPTION")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR.value()).body(error);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<?> handleErrorException(AppException ex, HttpServletRequest request) {
        ErrorCode errorCode = ex.getErrorCode();
        log.error("ErrorException at [{} {}] message={}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);



        ErrorResponse error = ErrorResponse.builder()
                .status(errorCode.getHttpStatus().value())
                .error(errorCode.name())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(errorCode.getHttpStatus()).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAnyException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at [{} {}]: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(),
                ex);
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("INTERNAL_SERVER_ERROR")
                .message("Internal server error")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        log.error("Bad credentials at [{} {}]: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(),
                ex);
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("UNAUTHORIZED")
                .message("Invalid username or password")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        log.error("Illegal argument at [{} {}]: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(),
                ex);
        ErrorResponse error = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("BAD_REQUEST")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
