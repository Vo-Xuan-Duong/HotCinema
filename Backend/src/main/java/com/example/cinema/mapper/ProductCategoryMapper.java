package com.example.cinema.mapper;

import com.example.cinema.dto.productcategory.ProductCategoryCreateRequest;
import com.example.cinema.dto.productcategory.ProductCategoryUpdateRequest;
import com.example.cinema.dto.productcategory.ProductCategoryResponse;
import com.example.cinema.entity.ProductCategory;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductCategoryMapper {

    ProductCategory toEntity(ProductCategoryCreateRequest request);

    ProductCategoryResponse toResponse(ProductCategory entity);

    List<ProductCategoryResponse> toResponseList(List<ProductCategory> entities);

    void updateEntityFromRequest(ProductCategoryUpdateRequest request, @MappingTarget ProductCategory entity);
}
