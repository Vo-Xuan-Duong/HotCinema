package com.example.cinema.dto.paymentwebhook;

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

    private PaymentProvider provider;
    private String externalEventId;
    private String payload;
    private String signature;
    private Boolean verified;
    private Boolean processed;
    private ZonedDateTime processedAt;
}
