package com.example.hotcinemas_be.dtos.city.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CityResponse {
    private Long id;
    private String name;
    private String code;
    private String country;
    private boolean isActive;

}
