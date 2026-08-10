package com.example.cinema.dto.promotioncode;

import java.time.ZonedDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionCodeResponse {

    private UUID id;
    private java.util.UUID promotionId;
    private String code;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean active;
    private ZonedDateTime createdAt;
}
