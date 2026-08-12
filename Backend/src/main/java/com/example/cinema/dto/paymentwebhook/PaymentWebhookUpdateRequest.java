package com.example.cinema.dto.paymentwebhook;

import jakarta.validation.constraints.*;

import com.example.cinema.entity.enums.PaymentProvider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentWebhookUpdateRequest {

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
