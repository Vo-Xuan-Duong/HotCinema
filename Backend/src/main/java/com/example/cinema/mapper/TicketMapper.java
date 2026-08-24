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
    @Mapping(target = "bookingCode", source = "booking.bookingCode")
    @Mapping(target = "bookingSeatId", source = "bookingSeat.id")
    @Mapping(target = "seatName", source = "bookingSeat.seatName")
    @Mapping(target = "seatTypeName", source = "bookingSeat.seatTypeName")
    @Mapping(target = "unitPrice", source = "bookingSeat.unitPrice")
    @Mapping(target = "checkedInById", source = "checkedInBy.id")
    @Mapping(target = "showtimeId", source = "booking.showtime.id")
    @Mapping(target = "movieTitle", source = "booking.showtime.movie.title")
    @Mapping(target = "moviePosterUrl", source = "booking.showtime.movie.posterUrl")
    @Mapping(target = "cinemaName", source = "booking.showtime.auditorium.cinema.name")
    @Mapping(target = "cinemaAddress", source = "booking.showtime.auditorium.cinema.address")
    @Mapping(target = "roomName", source = "booking.showtime.auditorium.name")
    @Mapping(target = "showtimeStartTime", source = "booking.showtime.startTime")
    @Mapping(target = "showtimeEndTime", source = "booking.showtime.endTime")
    @Mapping(target = "showtimeFormat", source = "booking.showtime.format")
    @Mapping(target = "language", source = "booking.showtime.language")
    @Mapping(target = "subtitle", source = "booking.showtime.subtitle")
    TicketResponse toResponse(Ticket entity);

    List<TicketResponse> toResponseList(List<Ticket> entities);

    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "bookingSeat", ignore = true)
    @Mapping(target = "checkedInBy", ignore = true)
    void updateEntityFromRequest(TicketUpdateRequest request, @MappingTarget Ticket entity);
}
