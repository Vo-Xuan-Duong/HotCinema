package com.example.cinema.mapper;

import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.dto.booking.BookingUpdateRequest;
import com.example.cinema.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "showtime", ignore = true)
    Booking toEntity(BookingCreateRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "showtimeId", source = "showtime.id")
    BookingResponse toResponse(Booking entity);

    List<BookingResponse> toResponseList(List<Booking> entities);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "showtime", ignore = true)
    void updateEntityFromRequest(BookingUpdateRequest request, @MappingTarget Booking entity);
}
