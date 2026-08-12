package com.example.cinema.dto.cinema;

import jakarta.validation.constraints.*;

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

    @NotBlank

    private String code;
    @NotBlank
    private String name;
    @NotBlank
    private String address;
    @NotBlank
    private String ward;
    @NotBlank
    private String district;
    @NotBlank
    private String city;
    @NotNull
    private BigDecimal latitude;
    @NotNull
    private BigDecimal longitude;
    @NotBlank
    private String phone;
    @NotBlank
    private String email;
    @NotBlank
    private String description;
    @NotBlank
    private String logoUrl;
    @NotNull
    private CinemaStatus status;
}
