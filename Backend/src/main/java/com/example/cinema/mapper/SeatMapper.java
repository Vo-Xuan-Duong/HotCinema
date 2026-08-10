package com.example.cinema.mapper;

import com.example.cinema.dto.seat.SeatCreateRequest;
import com.example.cinema.dto.seat.SeatUpdateRequest;
import com.example.cinema.dto.seat.SeatResponse;
import com.example.cinema.entity.Seat;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SeatMapper {

    Seat toEntity(SeatCreateRequest request);

    SeatResponse toResponse(Seat entity);

    List<SeatResponse> toResponseList(List<Seat> entities);

    void updateEntityFromRequest(SeatUpdateRequest request, @MappingTarget Seat entity);
}
