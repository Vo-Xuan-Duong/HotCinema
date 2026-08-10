package com.example.cinema.mapper;

import com.example.cinema.dto.bookingitem.BookingItemCreateRequest;
import com.example.cinema.dto.bookingitem.BookingItemUpdateRequest;
import com.example.cinema.dto.bookingitem.BookingItemResponse;
import com.example.cinema.entity.BookingItem;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingItemMapper {

    BookingItem toEntity(BookingItemCreateRequest request);

    BookingItemResponse toResponse(BookingItem entity);

    List<BookingItemResponse> toResponseList(List<BookingItem> entities);

    void updateEntityFromRequest(BookingItemUpdateRequest request, @MappingTarget BookingItem entity);
}
