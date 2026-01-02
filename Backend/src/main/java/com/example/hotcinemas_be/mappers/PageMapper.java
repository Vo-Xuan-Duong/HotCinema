package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class PageMapper {

    public <T, U> PageResponse<U> toPageResponse(Page<T> page, Function<T, U> mapper) {
        java.util.List<U> content = page.getContent().stream()
                .map(mapper)
                .toList();
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
