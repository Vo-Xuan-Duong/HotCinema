package com.example.cinema.common.response;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        PageMetadata pagination
) {
}
