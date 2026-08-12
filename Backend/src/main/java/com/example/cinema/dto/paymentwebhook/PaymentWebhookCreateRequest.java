package com.example.cinema.dto.paymentwebhook;

import jakarta.validation.constraints.*;

import java.time.ZonedDateTime;

import com.example.cinema.entity.enums.PaymentProvider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentWebhookCreateRequest {

    @NotNull

    private PaymentProvider provider;
    @NotBlank
    private String externalEventId;
    @NotBlank
    private String payload;
    @NotBlank
    private String signature;
    @NotNull
    private Boolean verified;
    @NotNull
    private Boolean processed;
    @NotNull
    private ZonedDateTime processedAt;
}
