package com.example.cinema.mapper;

import com.example.cinema.dto.showtimeseat.ShowtimeSeatCreateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatUpdateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import com.example.cinema.entity.ShowtimeSeat;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShowtimeSeatMapper {

    ShowtimeSeat toEntity(ShowtimeSeatCreateRequest request);

    ShowtimeSeatResponse toResponse(ShowtimeSeat entity);

    List<ShowtimeSeatResponse> toResponseList(List<ShowtimeSeat> entities);

    void updateEntityFromRequest(ShowtimeSeatUpdateRequest request, @MappingTarget ShowtimeSeat entity);
}
