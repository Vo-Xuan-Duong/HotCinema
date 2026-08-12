package com.example.cinema.dto.promotioncode;

import jakarta.validation.constraints.*;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionCodeCreateRequest {

    private java.util.UUID promotionId;
    @NotBlank
    private String code;
    @NotNull
    private Integer usageLimit;
    @NotNull
    private Integer usedCount;
    @NotNull
    private Boolean active;
}
