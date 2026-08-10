package com.example.cinema.mapper;

import com.example.cinema.dto.seattype.SeatTypeCreateRequest;
import com.example.cinema.dto.seattype.SeatTypeUpdateRequest;
import com.example.cinema.dto.seattype.SeatTypeResponse;
import com.example.cinema.entity.SeatType;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SeatTypeMapper {

    SeatType toEntity(SeatTypeCreateRequest request);

    SeatTypeResponse toResponse(SeatType entity);

    List<SeatTypeResponse> toResponseList(List<SeatType> entities);

    void updateEntityFromRequest(SeatTypeUpdateRequest request, @MappingTarget SeatType entity);
}
