package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.region.response.RegionResponse;
import org.springframework.stereotype.Component;

@Component
public class RegionMapper {
    public RegionResponse mapToResponse(com.example.hotcinemas_be.models.Region region) {
        return RegionResponse.builder()
                .id(region.getId())
                .name(region.getName())
                .slug(region.getSlug())
                .isActive(region.getIsActive())
                .build();
    }
}
