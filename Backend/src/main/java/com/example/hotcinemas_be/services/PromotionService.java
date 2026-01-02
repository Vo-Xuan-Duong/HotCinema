package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.promotion.requests.PromotionRequest;
import com.example.hotcinemas_be.dtos.promotion.responses.PromotionResponse;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.VoucherMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    public VoucherService(VoucherRepository voucherRepository,
                          VoucherMapper voucherMapper) {
        this.voucherRepository = voucherRepository;
        this.voucherMapper = voucherMapper;
    }

    public PromotionResponse createVoucher(PromotionRequest promotionRequest) {
        Voucher voucher = new Voucher();
        voucher.setCode(promotionRequest.getCode());
        voucher.setDescription(promotionRequest.getDescription());
        voucher.setQuantity(promotionRequest.getQuantity());
        voucher.setStartDate(promotionRequest.getStartDate());
        voucher.setEndDate(promotionRequest.getEndDate());
        voucher.setDiscountValue(BigDecimal.valueOf(promotionRequest.getDiscountValue()));
        voucher.setMinOrderAmount(toBigDecimal(promotionRequest.getMinOrderAmount()));
        voucher.setMaxDiscountAmount(toBigDecimal(promotionRequest.getMaxDiscountAmount()));
        voucher.setVoucherType(promotionRequest.getVoucherType());

        return voucherMapper.mapToResponse(voucherRepository.save(voucher));
    }

    public PromotionResponse getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException("Voucher not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        return voucherMapper.mapToResponse(voucher);
    }

    public PromotionResponse updateVoucher(Long id, PromotionRequest promotionRequest) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException("Voucher not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        voucher.setCode(promotionRequest.getCode());
        voucher.setDescription(promotionRequest.getDescription());
        voucher.setQuantity(promotionRequest.getQuantity());
        voucher.setDiscountValue(BigDecimal.valueOf(promotionRequest.getDiscountValue()));
        voucher.setStartDate(promotionRequest.getStartDate());
        voucher.setEndDate(promotionRequest.getEndDate());
        voucher.setMinOrderAmount(toBigDecimal(promotionRequest.getMinOrderAmount()));
        voucher.setMaxDiscountAmount(toBigDecimal(promotionRequest.getMaxDiscountAmount()));
        voucher.setVoucherType(promotionRequest.getVoucherType());

        return voucherMapper.mapToResponse(voucherRepository.save(voucher));
    }

    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException("Voucher not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        voucherRepository.delete(voucher);
    }

    public PromotionResponse getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findVoucherByCode(code)
                .orElseThrow(() -> new AppException("Voucher not found with code: " + code,
                        ErrorCode.MODEL_NOT_FOUND));
        return voucherMapper.mapToResponse(voucher);
    }

    public Page<PromotionResponse> getAllVouchers(Pageable pageable) {
        Page<Voucher> vouchers = voucherRepository.findAll(pageable);
        if (vouchers.getTotalElements() == 0) {
            throw new AppException("No vouchers found", ErrorCode.MODEL_NOT_FOUND);
        }
        return vouchers.map(voucherMapper::mapToResponse);
    }

    public void activateVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException("Voucher not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        voucher.setIsActive(true);
        voucherRepository.save(voucher);
    }

    public void deactivateVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException("Voucher not found with id: " + id,
                        ErrorCode.MODEL_NOT_FOUND));
        voucher.setIsActive(false);
        voucherRepository.save(voucher);
    }

    private void useVoucher(Voucher voucher) {
        if (voucher.getQuantity() != null && voucher.getQuantity() > 0) {
            voucher.setQuantity(voucher.getQuantity() - 1);
            voucherRepository.save(voucher);
        } else {
            throw new AppException("Voucher is out of stock", ErrorCode.VOUCHER_OUT_OF_STOCK);
        }
    }

    public Page<PromotionResponse> getActiveVouchers(Pageable pageable) {
        Page<Voucher> vouchers = voucherRepository.findVouchersByIsActive(true, pageable);
        if (vouchers.getTotalElements() == 0) {
            throw new AppException("No active vouchers found", ErrorCode.MODEL_NOT_FOUND);
        }
        return vouchers.map(voucherMapper::mapToResponse);
    }

    public BigDecimal calculateDiscount(String code, BigDecimal totalAmount) {
        if (code == null || code.isBlank() || totalAmount == null) {
            return BigDecimal.ZERO;
        }

        Voucher voucher = voucherRepository.findVoucherByCode(code)
                .orElseThrow(() -> new AppException("Voucher not found", ErrorCode.VOUCHER_NOT_FOUND));

        useVoucher(voucher);

        if (Boolean.FALSE.equals(voucher.getIsActive()))
            return BigDecimal.ZERO;
        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0)
            return BigDecimal.ZERO;

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate()))
            return BigDecimal.ZERO;
        if (voucher.getQuantity() != null && voucher.getQuantity() <= 0)
            return BigDecimal.ZERO;
        if (voucher.getMinOrderAmount() != null && totalAmount.compareTo(voucher.getMinOrderAmount()) < 0)
            return BigDecimal.ZERO;

        BigDecimal discount;
        BigDecimal discountValue = voucher.getDiscountValue();

        if (discountValue == null || discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException("Invalid discount value", ErrorCode.VOUCHER_INVALID);
        }

        VoucherType type = voucher.getVoucherType();
        if (type == null) {
            throw new AppException("Voucher type is required", ErrorCode.VOUCHER_INVALID);
        }

        switch (type) {
            case PERCENTAGE -> {
                if (discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
                    throw new AppException("Percent must be <= 100", ErrorCode.VOUCHER_INVALID);
                }
                discount = totalAmount
                        .multiply(discountValue)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            case FIXED_AMOUNT -> {
                discount = discountValue.setScale(2, RoundingMode.HALF_UP);
                if (discount.compareTo(totalAmount) > 0) {
                    discount = totalAmount;
                }
            }
            default -> throw new AppException("Unsupported voucher type", ErrorCode.VOUCHER_INVALID);
        }

        if (voucher.getMaxDiscountAmount() != null) {
            BigDecimal cap = voucher.getMaxDiscountAmount().setScale(2, RoundingMode.HALF_UP);
            discount = discount.min(cap);
        }

        return discount.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }
    private BigDecimal toBigDecimal(Double value) {
        return value != null ? BigDecimal.valueOf(value) : null;
    }
}
