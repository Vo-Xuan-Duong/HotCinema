package com.example.cinema.mapper;

import com.example.cinema.dto.payment.PaymentCreateRequest;
import com.example.cinema.dto.payment.PaymentResponse;
import com.example.cinema.dto.payment.PaymentUpdateRequest;
import com.example.cinema.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    @Mapping(target = "booking", ignore = true)
    Payment toEntity(PaymentCreateRequest request);

    @Mapping(target = "bookingId", source = "booking.id")
    PaymentResponse toResponse(Payment entity);

    List<PaymentResponse> toResponseList(List<Payment> entities);

    @Mapping(target = "booking", ignore = true)
    void updateEntityFromRequest(PaymentUpdateRequest request, @MappingTarget Payment entity);
}
