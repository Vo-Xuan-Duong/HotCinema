package com.example.cinema.mapper;

import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import com.example.cinema.entity.Showtime;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShowtimeMapper {

    Showtime toEntity(ShowtimeCreateRequest request);

    ShowtimeResponse toResponse(Showtime entity);

    List<ShowtimeResponse> toResponseList(List<Showtime> entities);

    void updateEntityFromRequest(ShowtimeUpdateRequest request, @MappingTarget Showtime entity);
}
