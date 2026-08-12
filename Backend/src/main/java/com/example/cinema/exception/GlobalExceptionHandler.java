package com.example.cinema.exception;

import com.example.cinema.common.response.ErrorResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
        log.error("AppException: {}", ex.getMessage(), ex);
        ErrorCode errorCode = ex.getErrorCode();
        
        ErrorResponse errorResponse = new ErrorResponse(
                "https://example.com/errors/" + errorCode.getCode().toLowerCase(),
                errorCode.getDefaultMessage(),
                errorCode.getHttpStatus().value(),
                ex.getDetailMessage() != null ? ex.getDetailMessage() : errorCode.getDefaultMessage(),
                errorCode.getCode(),
                null,
                null
        );

        return ResponseEntity.status(errorCode.getHttpStatus()).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, List<String>> errors = new HashMap<>();
        
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.computeIfAbsent(error.getField(), k -> new ArrayList<>()).add(error.getDefaultMessage());
        }

        ErrorResponse errorResponse = new ErrorResponse(
                "https://example.com/errors/validation",
                "Validation Failed",
                HttpStatus.BAD_REQUEST.value(),
                "Invalid input data",
                "VALIDATION_FAILED",
                null, 
                errors
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        log.error("DataIntegrityViolationException: {}", ex.getMessage(), ex);
        ErrorCode errorCode = ErrorCode.DATA_INTEGRITY_VIOLATION;
        
        ErrorResponse errorResponse = new ErrorResponse(
                "https://example.com/errors/" + errorCode.getCode().toLowerCase(),
                errorCode.getDefaultMessage(),
                errorCode.getHttpStatus().value(),
                "Database constraint violated: " + ex.getMostSpecificCause().getMessage(),
                errorCode.getCode(),
                null,
                null
        );

        return ResponseEntity.status(errorCode.getHttpStatus()).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
        
        ErrorResponse errorResponse = new ErrorResponse(
                "https://example.com/errors/internal",
                errorCode.getDefaultMessage(),
                errorCode.getHttpStatus().value(),
                "An unexpected error occurred",
                errorCode.getCode(),
                null,
                null
        );

        return ResponseEntity.status(errorCode.getHttpStatus()).body(errorResponse);
    }
}
