package com.example.cinema.dto.product;

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
    private String code;
    private String name;
    private String description;
    private String imageUrl;
    private ProductStatus status;
}
