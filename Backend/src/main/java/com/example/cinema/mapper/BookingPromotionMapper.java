package com.example.cinema.mapper;

import com.example.cinema.dto.bookingpromotion.BookingPromotionCreateRequest;
import com.example.cinema.dto.bookingpromotion.BookingPromotionUpdateRequest;
import com.example.cinema.dto.bookingpromotion.BookingPromotionResponse;
import com.example.cinema.entity.BookingPromotion;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingPromotionMapper {

    BookingPromotion toEntity(BookingPromotionCreateRequest request);

    BookingPromotionResponse toResponse(BookingPromotion entity);

    List<BookingPromotionResponse> toResponseList(List<BookingPromotion> entities);

    void updateEntityFromRequest(BookingPromotionUpdateRequest request, @MappingTarget BookingPromotion entity);
}
