package com.example.cinema.dto.productcategory;

import jakarta.validation.constraints.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategoryCreateRequest {

    @NotBlank

    private String code;
    @NotBlank
    private String name;
}
