package com.example.cinema.mapper;

import com.example.cinema.dto.moviemedia.MovieMediaCreateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaUpdateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaResponse;
import com.example.cinema.entity.MovieMedia;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MovieMediaMapper {

    MovieMedia toEntity(MovieMediaCreateRequest request);

    MovieMediaResponse toResponse(MovieMedia entity);

    List<MovieMediaResponse> toResponseList(List<MovieMedia> entities);

    void updateEntityFromRequest(MovieMediaUpdateRequest request, @MappingTarget MovieMedia entity);
}
