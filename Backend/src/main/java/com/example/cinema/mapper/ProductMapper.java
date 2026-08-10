package com.example.cinema.mapper;

import com.example.cinema.dto.product.ProductCreateRequest;
import com.example.cinema.dto.product.ProductUpdateRequest;
import com.example.cinema.dto.product.ProductResponse;
import com.example.cinema.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    Product toEntity(ProductCreateRequest request);

    ProductResponse toResponse(Product entity);

    List<ProductResponse> toResponseList(List<Product> entities);

    void updateEntityFromRequest(ProductUpdateRequest request, @MappingTarget Product entity);
}
