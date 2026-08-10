package com.example.cinema.dto.paymentwebhook;

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

    private PaymentProvider provider;
    private String externalEventId;
    private String payload;
    private String signature;
    private Boolean verified;
    private Boolean processed;
    private ZonedDateTime processedAt;
}
