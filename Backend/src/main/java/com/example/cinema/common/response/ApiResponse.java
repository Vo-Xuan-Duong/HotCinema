package com.example.cinema.common.response;

public record ApiResponse<T>(
        T data
) {}
