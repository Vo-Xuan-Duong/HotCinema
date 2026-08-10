package com.example.cinema.mapper;

import com.example.cinema.dto.movie.MovieCreateRequest;
import com.example.cinema.dto.movie.MovieUpdateRequest;
import com.example.cinema.dto.movie.MovieResponse;
import com.example.cinema.entity.Movie;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MovieMapper {

    Movie toEntity(MovieCreateRequest request);

    MovieResponse toResponse(Movie entity);

    List<MovieResponse> toResponseList(List<Movie> entities);

    void updateEntityFromRequest(MovieUpdateRequest request, @MappingTarget Movie entity);
}
