package com.example.cinema.mapper;

import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryCreateRequest;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryUpdateRequest;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryResponse;
import com.example.cinema.entity.BookingStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingStatusHistoryMapper {

    BookingStatusHistory toEntity(BookingStatusHistoryCreateRequest request);

    BookingStatusHistoryResponse toResponse(BookingStatusHistory entity);

    List<BookingStatusHistoryResponse> toResponseList(List<BookingStatusHistory> entities);

    void updateEntityFromRequest(BookingStatusHistoryUpdateRequest request, @MappingTarget BookingStatusHistory entity);
}
