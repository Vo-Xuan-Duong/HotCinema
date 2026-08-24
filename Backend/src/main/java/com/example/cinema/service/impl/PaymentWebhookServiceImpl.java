package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.paymentwebhook.MomoIpnResponse;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookCreateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookResponse;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookUpdateRequest;
import com.example.cinema.entity.Payment;
import com.example.cinema.entity.PaymentWebhook;
import com.example.cinema.entity.enums.PaymentProvider;
import com.example.cinema.entity.enums.PaymentStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.PaymentWebhookMapper;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.repository.PaymentWebhookRepository;
import com.example.cinema.service.PaymentService;
import com.example.cinema.service.PaymentWebhookService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.ZonedDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentWebhookServiceImpl implements PaymentWebhookService {

    private final PaymentWebhookRepository repository;
    private final PaymentWebhookMapper paymentWebhookMapper;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    @Value("${app.payment.momo.access-key:}")
    private String momoAccessKey;

    @Value("${app.payment.momo.secret-key:}")
    private String momoSecretKey;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentWebhookResponse> findAll() {
        return paymentWebhookMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentWebhookResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(paymentWebhookMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "paymentwebhooks", key = "#id")
    public PaymentWebhookResponse findById(UUID id) {
        return repository.findById(id)
                .map(paymentWebhookMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentWebhook", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"paymentwebhooks", "payments", "bookings", "tickets", "showtimeseats"}, allEntries = true)
    public MomoIpnResponse processMomoIpn(String payload) {
        requireMomoCredentials();
        JsonNode root = parsePayload(payload);

        String orderId = requiredText(root, "orderId");
        String requestId = requiredText(root, "requestId");
        String partnerCode = requiredText(root, "partnerCode");
        String signature = requiredText(root, "signature");
        String transactionId = text(root, "transId");
        int resultCode = root.path("resultCode").asInt(Integer.MIN_VALUE);
        if (resultCode == Integer.MIN_VALUE) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Missing MoMo resultCode");
        }

        String externalEventId = transactionId.isBlank() || "0".equals(transactionId)
                ? requestId + ":" + orderId + ":" + resultCode
                : transactionId;
        ZonedDateTime now = ZonedDateTime.now();

        PaymentWebhook webhook = repository.findByProviderAndExternalEventId(PaymentProvider.MOMO, externalEventId)
                .orElseGet(() -> PaymentWebhook.builder()
                        .provider(PaymentProvider.MOMO)
                        .externalEventId(externalEventId)
                        .createdAt(now)
                        .build());
        webhook.setPayload(payload);
        webhook.setSignature(signature);

        boolean verified = verifyMomoSignature(root, signature);
        webhook.setVerified(verified);
        if (!verified) {
            webhook.setProcessed(false);
            webhook.setProcessedAt(null);
            repository.save(webhook);
            return buildAck(root, 1, "invalid signature");
        }

        if (Boolean.TRUE.equals(webhook.getProcessed())) {
            repository.save(webhook);
            return buildAck(root, 0, "success");
        }

        Payment payment = paymentRepository
                .findByProviderAndProviderOrderIdAndIsActiveTrue(PaymentProvider.MOMO, orderId)
                .orElse(null);
        if (payment == null) {
            webhook.setProcessed(false);
            webhook.setProcessedAt(null);
            repository.save(webhook);
            return buildAck(root, 1, "payment not found");
        }

        BigDecimal callbackAmount = decimal(root, "amount");
        if (payment.getAmount() == null || callbackAmount.compareTo(payment.getAmount()) != 0) {
            webhook.setProcessed(false);
            webhook.setProcessedAt(null);
            repository.save(webhook);
            return buildAck(root, 1, "amount mismatch");
        }

        if (resultCode == 0) {
            if (!transactionId.isBlank() && !transactionId.equals(payment.getProviderTransactionId())) {
                paymentService.updateTransactionId(payment.getId(), transactionId);
            }
            if (payment.getStatus() != PaymentStatus.SUCCESS) {
                paymentService.updateStatus(payment.getId(), PaymentStatus.SUCCESS);
            }
        } else if (payment.getStatus() != PaymentStatus.SUCCESS
                && payment.getStatus() != PaymentStatus.REFUNDED
                && payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            paymentService.updateStatus(payment.getId(), PaymentStatus.FAILED);
        }

        webhook.setProcessed(true);
        webhook.setProcessedAt(now);
        repository.save(webhook);
        return buildAck(root, 0, "success");
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymentwebhooks", allEntries = true)
    public PaymentWebhookResponse create(PaymentWebhookCreateRequest request) {
        PaymentWebhook entity = paymentWebhookMapper.toEntity(request);
        return paymentWebhookMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymentwebhooks", allEntries = true)
    public PaymentWebhookResponse update(UUID id, PaymentWebhookUpdateRequest request) {
        PaymentWebhook entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentWebhook", id.toString()));
        paymentWebhookMapper.updateEntityFromRequest(request, entity);
        return paymentWebhookMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymentwebhooks", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    private JsonNode parsePayload(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (JsonProcessingException exception) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Invalid MoMo JSON payload");
        }
    }

    private boolean verifyMomoSignature(JsonNode root, String suppliedSignature) {
        String rawData;
        if (root.has("callbackToken") || root.has("partnerClientId")) {
            rawData = "accessKey=" + momoAccessKey
                    + "&amount=" + text(root, "amount")
                    + "&callbackToken=" + text(root, "callbackToken")
                    + "&extraData=" + text(root, "extraData")
                    + "&message=" + text(root, "message")
                    + "&orderId=" + text(root, "orderId")
                    + "&orderInfo=" + text(root, "orderInfo")
                    + "&orderType=" + text(root, "orderType")
                    + "&partnerClientId=" + text(root, "partnerClientId")
                    + "&partnerCode=" + text(root, "partnerCode")
                    + "&payType=" + text(root, "payType")
                    + "&requestId=" + text(root, "requestId")
                    + "&responseTime=" + text(root, "responseTime")
                    + "&resultCode=" + text(root, "resultCode")
                    + "&transId=" + text(root, "transId");
        } else {
            rawData = "accessKey=" + momoAccessKey
                    + "&amount=" + text(root, "amount")
                    + "&extraData=" + text(root, "extraData")
                    + "&message=" + text(root, "message")
                    + "&orderId=" + text(root, "orderId")
                    + "&orderInfo=" + text(root, "orderInfo")
                    + "&orderType=" + text(root, "orderType")
                    + "&partnerCode=" + text(root, "partnerCode")
                    + "&payType=" + text(root, "payType")
                    + "&requestId=" + text(root, "requestId")
                    + "&responseTime=" + text(root, "responseTime")
                    + "&resultCode=" + text(root, "resultCode")
                    + "&transId=" + text(root, "transId");
        }

        String expected = hmacSha256(rawData, momoSecretKey);
        byte[] expectedBytes = expected.getBytes(StandardCharsets.US_ASCII);
        byte[] suppliedBytes = suppliedSignature.trim().toLowerCase().getBytes(StandardCharsets.US_ASCII);
        return MessageDigest.isEqual(expectedBytes, suppliedBytes);
    }

    private MomoIpnResponse buildAck(JsonNode root, int resultCode, String message) {
        long responseTime = System.currentTimeMillis();
        String extraData = text(root, "extraData");
        String partnerCode = text(root, "partnerCode");
        String requestId = text(root, "requestId");
        String orderId = text(root, "orderId");

        String rawData = "accessKey=" + momoAccessKey
                + "&extraData=" + extraData
                + "&message=" + message
                + "&orderId=" + orderId
                + "&partnerCode=" + partnerCode
                + "&requestId=" + requestId
                + "&responseTime=" + responseTime
                + "&resultCode=" + resultCode;

        return MomoIpnResponse.builder()
                .partnerCode(partnerCode)
                .requestId(requestId)
                .orderId(orderId)
                .resultCode(resultCode)
                .message(message)
                .responseTime(responseTime)
                .extraData(extraData)
                .signature(hmacSha256(rawData, momoSecretKey))
                .build();
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Unable to verify MoMo signature");
        }
    }

    private void requireMomoCredentials() {
        if (momoAccessKey == null || momoAccessKey.isBlank()
                || momoSecretKey == null || momoSecretKey.isBlank()) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "MoMo credentials are not configured");
        }
    }

    private BigDecimal decimal(JsonNode root, String field) {
        String value = requiredText(root, field);
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException exception) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Invalid MoMo " + field);
        }
    }

    private String requiredText(JsonNode root, String field) {
        String value = text(root, field);
        if (value.isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Missing MoMo " + field);
        }
        return value;
    }

    private String text(JsonNode root, String field) {
        JsonNode value = root.get(field);
        return value == null || value.isNull() ? "" : value.asText();
    }
}
