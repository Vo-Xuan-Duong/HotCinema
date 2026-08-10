package com.example.cinema.mapper;

import com.example.cinema.dto.paymentwebhook.PaymentWebhookCreateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookUpdateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookResponse;
import com.example.cinema.entity.PaymentWebhook;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentWebhookMapper {

    PaymentWebhook toEntity(PaymentWebhookCreateRequest request);

    PaymentWebhookResponse toResponse(PaymentWebhook entity);

    List<PaymentWebhookResponse> toResponseList(List<PaymentWebhook> entities);

    void updateEntityFromRequest(PaymentWebhookUpdateRequest request, @MappingTarget PaymentWebhook entity);
}
