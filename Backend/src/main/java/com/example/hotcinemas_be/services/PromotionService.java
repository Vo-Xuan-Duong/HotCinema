package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.promotion.requests.PromotionRequest;
import com.example.hotcinemas_be.dtos.promotion.responses.PromotionResponse;
import com.example.hotcinemas_be.enums.DiscountType;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.mappers.PromotionMapper;
import com.example.hotcinemas_be.models.Promotion;
import com.example.hotcinemas_be.repositorys.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;


    public PromotionResponse createPromotion(PromotionRequest promotionRequest) {

        if(promotionRepository.existsPromotionByCode(promotionRequest.getCode())) {
            throw new AppException("Promotion code already exists: " + promotionRequest.getCode(),
                    ErrorCode.PROMOTION_ALREADY_EXISTS);
        }

        Promotion promotion = new Promotion();
        promotion.setCode(promotionRequest.getCode());
        promotion.setName(promotionRequest.getName());
        promotion.setDescription(promotionRequest.getDescription());
        promotion.setDiscountType(promotionRequest.getDiscountType());
        promotion.setDiscountValue(promotionRequest.getDiscountValue());
        promotion.setMinPurchase(promotionRequest.getMinPurchase());
        promotion.setMaxDiscount(promotionRequest.getMaxDiscount());
        promotion.setUsageLimit(promotionRequest.getUsageLimit());
        promotion.setUsedCount(promotionRequest.getUsedCount());
        promotion.setStartDate(promotionRequest.getStartDate());
        promotion.setEndDate(promotionRequest.getEndDate());
        promotion.setIsActive(true);

        return promotionMapper.mapToResponse(promotionRepository.save(promotion));
    }

    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException("Promotion not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        return promotionMapper.mapToResponse(promotion);
    }

    public PromotionResponse updatePromotion(Long id, PromotionRequest promotionRequest) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException("Promotion not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        promotion.setCode(promotionRequest.getCode());
        promotion.setName(promotionRequest.getName());
        promotion.setDescription(promotionRequest.getDescription());
        promotion.setDiscountType(promotionRequest.getDiscountType());
        promotion.setDiscountValue(promotionRequest.getDiscountValue());
        promotion.setMinPurchase(promotionRequest.getMinPurchase());
        promotion.setMaxDiscount(promotionRequest.getMaxDiscount());
        promotion.setUsageLimit(promotionRequest.getUsageLimit());
        promotion.setUsedCount(promotionRequest.getUsedCount());
        promotion.setStartDate(promotionRequest.getStartDate());
        promotion.setEndDate(promotionRequest.getEndDate());

        return promotionMapper.mapToResponse(promotionRepository.save(promotion));
    }

    public void deletePromotion(Long id) {
        Promotion Promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException("Promotion not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        promotionRepository.delete(Promotion);
    }

    public PromotionResponse getPromotionByCode(String code) {
        Promotion Promotion = promotionRepository.findPromotionByCode(code)
                .orElseThrow(() -> new AppException("Promotion not found with code: " + code,
                        ErrorCode.MODEL_NOT_FOUND));
        return promotionMapper.mapToResponse(Promotion);
    }

    public Page<PromotionResponse> getAllPromotions(Pageable pageable) {
        Page<Promotion> Promotions = promotionRepository.findAll(pageable);
        if (Promotions.getTotalElements() == 0) {
            throw new AppException("No Promotions found", ErrorCode.MODEL_NOT_FOUND);
        }
        return Promotions.map(promotionMapper::mapToResponse);
    }

    public void activatePromotion(Long id) {
        Promotion Promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException("Promotion not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        Promotion.setIsActive(true);
        promotionRepository.save(Promotion);
    }

    public void deactivatePromotion(Long id) {
        Promotion Promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException("Promotion not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        Promotion.setIsActive(false);
        promotionRepository.save(Promotion);
    }

    private void usePromotion(Promotion promotion) {
        if(promotion.getUsedCount() < promotion.getUsageLimit()) {
            promotion.setUsedCount(promotion.getUsedCount() + 1);
            promotionRepository.save(promotion);
        }
    }

    public Page<PromotionResponse> getActivePromotions(Pageable pageable) {
        Page<Promotion> Promotions = promotionRepository.findPromotionsByIsActive(true, pageable);
        if (Promotions.getTotalElements() == 0) {
            throw new AppException("No active Promotions found", ErrorCode.MODEL_NOT_FOUND);
        }
        return Promotions.map(promotionMapper::mapToResponse);
    }

    public BigDecimal calculateDiscount(String code, BigDecimal totalAmount) {
        if (code == null || code.isBlank() || totalAmount == null) {
            return BigDecimal.ZERO;
        }

        Promotion Promotion = promotionRepository.findPromotionByCode(code)
                .orElseThrow(() -> new AppException("Promotion not found", ErrorCode.PROMOTION_NOT_FOUND));

        usePromotion(Promotion);

        if (Boolean.FALSE.equals(Promotion.getIsActive()))
            return BigDecimal.ZERO;
        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0)
            return BigDecimal.ZERO;

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(Promotion.getStartDate()) || now.isAfter(Promotion.getEndDate()))
            return BigDecimal.ZERO;
        if (Promotion.getUsedCount() >= Promotion.getUsageLimit())
            return BigDecimal.ZERO;
        if (Promotion.getMinPurchase() != null && totalAmount.compareTo(Promotion.getMinPurchase()) < 0)
            return BigDecimal.ZERO;

        BigDecimal discount;
        BigDecimal discountValue = Promotion.getDiscountValue();

        if (discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException("Invalid discount value", ErrorCode.PROMOTION_INVALID);
        }

        DiscountType type = Promotion.getDiscountType();
        if (type == null) {
            throw new AppException("Promotion type is required", ErrorCode.PROMOTION_INVALID);
        }

        switch (type) {
            case PERCENTAGE -> {
                if (discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
                    throw new AppException("Percent must be <= 100", ErrorCode.PROMOTION_INVALID);
                }
                discount = totalAmount
                        .multiply(discountValue)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            case FIXED -> {
                discount = discountValue.setScale(2, RoundingMode.HALF_UP);
                if (discount.compareTo(totalAmount) > 0) {
                    discount = totalAmount;
                }
            }
            default -> throw new AppException("Unsupported Promotion type", ErrorCode.PROMOTION_INVALID);
        }

        if (Promotion.getMaxDiscount() != null) {
            BigDecimal cap = Promotion.getMaxDiscount().setScale(2, RoundingMode.HALF_UP);
            discount = discount.min(cap);
        }

        return discount.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }
}
