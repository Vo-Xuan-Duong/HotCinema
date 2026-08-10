package com.example.cinema.mapper;

import com.example.cinema.dto.cinema.CinemaCreateRequest;
import com.example.cinema.dto.cinema.CinemaUpdateRequest;
import com.example.cinema.dto.cinema.CinemaResponse;
import com.example.cinema.entity.Cinema;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CinemaMapper {

    Cinema toEntity(CinemaCreateRequest request);

    CinemaResponse toResponse(Cinema entity);

    List<CinemaResponse> toResponseList(List<Cinema> entities);

    void updateEntityFromRequest(CinemaUpdateRequest request, @MappingTarget Cinema entity);
}
