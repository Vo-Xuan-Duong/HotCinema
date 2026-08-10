package com.example.cinema.mapper;

import com.example.cinema.dto.payment.PaymentCreateRequest;
import com.example.cinema.dto.payment.PaymentUpdateRequest;
import com.example.cinema.dto.payment.PaymentResponse;
import com.example.cinema.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    Payment toEntity(PaymentCreateRequest request);

    PaymentResponse toResponse(Payment entity);

    List<PaymentResponse> toResponseList(List<Payment> entities);

    void updateEntityFromRequest(PaymentUpdateRequest request, @MappingTarget Payment entity);
}
