package com.example.cinema.mapper;

import com.example.cinema.dto.auditorium.AuditoriumCreateRequest;
import com.example.cinema.dto.auditorium.AuditoriumUpdateRequest;
import com.example.cinema.dto.auditorium.AuditoriumResponse;
import com.example.cinema.entity.Auditorium;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuditoriumMapper {

    @Mapping(target = "cinema", ignore = true)
    Auditorium toEntity(AuditoriumCreateRequest request);

    @Mapping(target = "cinemaId", source = "cinema.id")
    AuditoriumResponse toResponse(Auditorium entity);

    List<AuditoriumResponse> toResponseList(List<Auditorium> entities);

    @Mapping(target = "cinema", ignore = true)
    void updateEntityFromRequest(AuditoriumUpdateRequest request, @MappingTarget Auditorium entity);
}
