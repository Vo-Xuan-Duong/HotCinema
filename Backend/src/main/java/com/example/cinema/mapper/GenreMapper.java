package com.example.cinema.mapper;

import com.example.cinema.dto.genre.GenreCreateRequest;
import com.example.cinema.dto.genre.GenreUpdateRequest;
import com.example.cinema.dto.genre.GenreResponse;
import com.example.cinema.entity.Genre;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GenreMapper {

    Genre toEntity(GenreCreateRequest request);

    GenreResponse toResponse(Genre entity);

    List<GenreResponse> toResponseList(List<Genre> entities);

    void updateEntityFromRequest(GenreUpdateRequest request, @MappingTarget Genre entity);
}
