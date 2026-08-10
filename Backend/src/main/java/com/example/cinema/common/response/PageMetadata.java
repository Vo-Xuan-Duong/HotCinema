package com.example.cinema.common.response;

public record PageMetadata(
        int page,
        int pageSize,
        long totalItems,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
) {}
