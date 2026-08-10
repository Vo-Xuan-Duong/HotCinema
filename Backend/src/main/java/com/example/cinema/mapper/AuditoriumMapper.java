package com.example.cinema.mapper;

import com.example.cinema.dto.auditorium.AuditoriumCreateRequest;
import com.example.cinema.dto.auditorium.AuditoriumUpdateRequest;
import com.example.cinema.dto.auditorium.AuditoriumResponse;
import com.example.cinema.entity.Auditorium;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuditoriumMapper {

    Auditorium toEntity(AuditoriumCreateRequest request);

    AuditoriumResponse toResponse(Auditorium entity);

    List<AuditoriumResponse> toResponseList(List<Auditorium> entities);

    void updateEntityFromRequest(AuditoriumUpdateRequest request, @MappingTarget Auditorium entity);
}
