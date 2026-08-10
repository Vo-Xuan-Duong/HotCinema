package com.example.cinema.mapper;

import com.example.cinema.dto.ticket.TicketCreateRequest;
import com.example.cinema.dto.ticket.TicketUpdateRequest;
import com.example.cinema.dto.ticket.TicketResponse;
import com.example.cinema.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TicketMapper {

    Ticket toEntity(TicketCreateRequest request);

    TicketResponse toResponse(Ticket entity);

    List<TicketResponse> toResponseList(List<Ticket> entities);

    void updateEntityFromRequest(TicketUpdateRequest request, @MappingTarget Ticket entity);
}
