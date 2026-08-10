package com.example.cinema.mapper;

import com.example.cinema.dto.cinemaproduct.CinemaProductCreateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductUpdateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductResponse;
import com.example.cinema.entity.CinemaProduct;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CinemaProductMapper {

    CinemaProduct toEntity(CinemaProductCreateRequest request);

    CinemaProductResponse toResponse(CinemaProduct entity);

    List<CinemaProductResponse> toResponseList(List<CinemaProduct> entities);

    void updateEntityFromRequest(CinemaProductUpdateRequest request, @MappingTarget CinemaProduct entity);
}
