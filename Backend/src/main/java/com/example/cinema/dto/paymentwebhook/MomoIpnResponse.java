package com.example.cinema.dto.paymentwebhook;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomoIpnResponse {
    private String partnerCode;
    private String requestId;
    private String orderId;
    private Integer resultCode;
    private String message;
    private Long responseTime;
    private String extraData;
    private String signature;
}
