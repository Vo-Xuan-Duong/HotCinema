package com.example.hotcinemas_be.dtos.region.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegionResponse {
    private Long id;
    private String name;
    private String slug;
    private boolean isActive;
}
