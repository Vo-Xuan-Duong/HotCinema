package com.example.cinema.mapper;

import com.example.cinema.dto.ticketscan.TicketScanCreateRequest;
import com.example.cinema.dto.ticketscan.TicketScanUpdateRequest;
import com.example.cinema.dto.ticketscan.TicketScanResponse;
import com.example.cinema.entity.TicketScan;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TicketScanMapper {

    TicketScan toEntity(TicketScanCreateRequest request);

    TicketScanResponse toResponse(TicketScan entity);

    List<TicketScanResponse> toResponseList(List<TicketScan> entities);

    void updateEntityFromRequest(TicketScanUpdateRequest request, @MappingTarget TicketScan entity);
}
