package com.example.cinema.common.response;

import java.util.List;
import java.util.Map;


public record ErrorResponse(
        String type,
        String title,
        int status,
        String detail,
        String errorCode,
        String traceId,
        Map<String, List<String>> errors
) {}
