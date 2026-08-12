package com.example.cinema.dto.product;

import jakarta.validation.constraints.*;

import java.util.UUID;

import com.example.cinema.entity.enums.ProductStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {

    private java.util.UUID categoryId;
    @NotBlank
    private String code;
    @NotBlank
    private String name;
    @NotBlank
    private String description;
    @NotBlank
    private String imageUrl;
    @NotNull
    private ProductStatus status;
}
