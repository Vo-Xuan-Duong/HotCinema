package com.example.cinema.mapper;

import com.example.cinema.dto.cinemaproduct.CinemaProductCreateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductResponse;
import com.example.cinema.dto.cinemaproduct.CinemaProductUpdateRequest;
import com.example.cinema.entity.CinemaProduct;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CinemaProductMapper {

    @Mapping(target = "cinema", ignore = true)
    @Mapping(target = "product", ignore = true)
    CinemaProduct toEntity(CinemaProductCreateRequest request);

    @Mapping(target = "cinemaId", source = "cinema.id")
    @Mapping(target = "cinemaName", source = "cinema.name")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productDescription", source = "product.description")
    @Mapping(target = "productImageUrl", source = "product.imageUrl")
    @Mapping(target = "categoryCode", source = "product.category.code")
    @Mapping(target = "categoryName", source = "product.category.name")
    CinemaProductResponse toResponse(CinemaProduct entity);

    List<CinemaProductResponse> toResponseList(List<CinemaProduct> entities);

    @Mapping(target = "cinema", ignore = true)
    @Mapping(target = "product", ignore = true)
    void updateEntityFromRequest(CinemaProductUpdateRequest request, @MappingTarget CinemaProduct entity);
}
