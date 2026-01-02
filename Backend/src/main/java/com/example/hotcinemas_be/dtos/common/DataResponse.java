package com.example.hotcinemas_be.dtos.common;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class ResponseData<T> {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    private String path;
    private T data;

}
