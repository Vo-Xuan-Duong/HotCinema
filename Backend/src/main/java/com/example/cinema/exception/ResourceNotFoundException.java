package com.example.cinema.exception;

public class ResourceNotFoundException extends AppException {
    
    public ResourceNotFoundException(String resourceName, String identifier) {
        super(ErrorCode.RESOURCE_NOT_FOUND, resourceName + " not found with identifier: " + identifier);
    }
}
