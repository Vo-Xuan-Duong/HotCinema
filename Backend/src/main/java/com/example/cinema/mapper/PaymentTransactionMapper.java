package com.example.cinema.mapper;

import com.example.cinema.dto.paymenttransaction.PaymentTransactionCreateRequest;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionUpdateRequest;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionResponse;
import com.example.cinema.entity.PaymentTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentTransactionMapper {

    PaymentTransaction toEntity(PaymentTransactionCreateRequest request);

    PaymentTransactionResponse toResponse(PaymentTransaction entity);

    List<PaymentTransactionResponse> toResponseList(List<PaymentTransaction> entities);

    void updateEntityFromRequest(PaymentTransactionUpdateRequest request, @MappingTarget PaymentTransaction entity);
}
