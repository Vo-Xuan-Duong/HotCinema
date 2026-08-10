package com.example.cinema.mapper;

import com.example.cinema.dto.bookingseat.BookingSeatCreateRequest;
import com.example.cinema.dto.bookingseat.BookingSeatUpdateRequest;
import com.example.cinema.dto.bookingseat.BookingSeatResponse;
import com.example.cinema.entity.BookingSeat;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingSeatMapper {

    BookingSeat toEntity(BookingSeatCreateRequest request);

    BookingSeatResponse toResponse(BookingSeat entity);

    List<BookingSeatResponse> toResponseList(List<BookingSeat> entities);

    void updateEntityFromRequest(BookingSeatUpdateRequest request, @MappingTarget BookingSeat entity);
}
