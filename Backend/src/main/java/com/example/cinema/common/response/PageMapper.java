package com.example.cinema.common.response;

import org.springframework.data.domain.Page;

public class PageMapper {
    public static <T> PageResponse<T> toPageResponse(Page<T> page) {
        PageMetadata metadata = new PageMetadata(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
        return new PageResponse<>(page.getContent(), metadata);
    }
}
