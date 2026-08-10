package com.example.cinema.dto.cinema;

import com.example.cinema.entity.enums.CinemaStatus;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaUpdateRequest {

    private String code;
    private String name;
    private String address;
    private String ward;
    private String district;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String email;
    private String description;
    private String logoUrl;
    private CinemaStatus status;
}
