package com.example.cinema.mapper;

import com.example.cinema.dto.ticket.TicketCreateRequest;
import com.example.cinema.dto.ticket.TicketResponse;
import com.example.cinema.dto.ticket.TicketUpdateRequest;
import com.example.cinema.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TicketMapper {

    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "bookingSeat", ignore = true)
    @Mapping(target = "checkedInBy", ignore = true)
    Ticket toEntity(TicketCreateRequest request);

    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "bookingSeatId", source = "bookingSeat.id")
    @Mapping(target = "checkedInById", source = "checkedInBy.id")
    TicketResponse toResponse(Ticket entity);

    List<TicketResponse> toResponseList(List<Ticket> entities);

    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "bookingSeat", ignore = true)
    @Mapping(target = "checkedInBy", ignore = true)
    void updateEntityFromRequest(TicketUpdateRequest request, @MappingTarget Ticket entity);
}
