package com.example.cinema.mapper;

import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.entity.Showtime;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShowtimeMapper {

    @Mapping(target = "movie", ignore = true)
    @Mapping(target = "auditorium", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    Showtime toEntity(ShowtimeCreateRequest request);

    @Mapping(target = "movieId", source = "movie.id")
    @Mapping(target = "movieTitle", source = "movie.title")
    @Mapping(target = "auditoriumId", source = "auditorium.id")
    @Mapping(target = "roomId", source = "auditorium.id")
    @Mapping(target = "roomName", source = "auditorium.name")
    @Mapping(target = "cinemaId", source = "auditorium.cinema.id")
    @Mapping(target = "cinemaName", source = "auditorium.cinema.name")
    @Mapping(target = "showDate", expression = "java(entity.getStartTime() == null ? null : entity.getStartTime().toLocalDate())")
    @Mapping(target = "price", source = "basePrice")
    @Mapping(target = "createdById", source = "createdBy.id")
    ShowtimeResponse toResponse(Showtime entity);

    List<ShowtimeResponse> toResponseList(List<Showtime> entities);

    @Mapping(target = "movie", ignore = true)
    @Mapping(target = "auditorium", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    void updateEntityFromRequest(ShowtimeUpdateRequest request, @MappingTarget Showtime entity);
}
