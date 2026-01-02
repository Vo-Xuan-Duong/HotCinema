package com.example.hotcinemas_be.dtos.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * PageResponse - Generic record để trả về dữ liệu phân trang
 * Type info được xử lý bởi Redis ObjectMapper với activateDefaultTyping
 */
public record PageResponse<T>(
                @JsonProperty("content") List<T> content,
                @JsonProperty("page") int page,
                @JsonProperty("size") int size,
                @JsonProperty("totalElements") long totalElements,
                @JsonProperty("totalPages") int totalPages) {
        @JsonCreator
        public PageResponse {
                // Record constructor với @JsonCreator để Jackson deserialize đúng
        }
}
