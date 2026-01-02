package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.promotion.responses.PromotionResponse;
import org.springframework.stereotype.Service;

@Service
public class VoucherMapper {
    public PromotionResponse mapToResponse(Voucher voucher) {
        if (voucher == null) {
            return null;
        }

        PromotionResponse response = new PromotionResponse();
        response.setId(voucher.getId());
        response.setCode(voucher.getCode());
        response.setDescription(voucher.getDescription());
        response.setVoucherType(voucher.getVoucherType() != null ? voucher.getVoucherType().name() : null);
        response.setQuantity(voucher.getQuantity());
        response.setDiscountValue(voucher.getDiscountValue());
        response.setStartDate(voucher.getStartDate());
        response.setEndDate(voucher.getEndDate());
        response.setMinOrderAmount(voucher.getMinOrderAmount());
        response.setMaxDiscountAmount(voucher.getMaxDiscountAmount());
        response.setActive(voucher.getIsActive());

        return response;
    }
}
