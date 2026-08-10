package com.example.cinema.dto.promotioncode;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionCodeUpdateRequest {

    private java.util.UUID promotionId;
    private String code;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean active;
}
