package com.example.cinema.service.payment;

import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Payment;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MomoPaymentGatewayClient {

    private final RestClient restClient;
    private final String partnerCode;
    private final String partnerName;
    private final String storeId;
    private final String accessKey;
    private final String secretKey;
    private final String redirectUrl;
    private final String ipnUrl;

    public MomoPaymentGatewayClient(
            @Value("${app.payment.momo.api-base-url:https://test-payment.momo.vn}") String apiBaseUrl,
            @Value("${app.payment.momo.partner-code:}") String partnerCode,
            @Value("${app.payment.momo.partner-name:HotCinema}") String partnerName,
            @Value("${app.payment.momo.store-id:HotCinema}") String storeId,
            @Value("${app.payment.momo.access-key:}") String accessKey,
            @Value("${app.payment.momo.secret-key:}") String secretKey,
            @Value("${app.payment.momo.redirect-url:}") String redirectUrl,
            @Value("${app.payment.momo.ipn-url:}") String ipnUrl) {
        this.restClient = RestClient.builder().baseUrl(apiBaseUrl).build();
        this.partnerCode = partnerCode;
        this.partnerName = partnerName;
        this.storeId = storeId;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.redirectUrl = redirectUrl;
        this.ipnUrl = ipnUrl;
    }

    public MomoCreateResult createPayment(Booking booking, String orderId, String requestId) {
        requireConfigured();
        long amount = wholeVndAmount(booking.getTotalAmount(), "Payment");
        if (amount <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Payment amount must be positive");
        }

        String extraData = Base64.getEncoder().encodeToString(
                booking.getId().toString().getBytes(StandardCharsets.UTF_8)
        );
        String orderInfo = "HotCinema booking " + booking.getBookingCode();
        String requestType = "payWithMethod";
        String rawData = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + requestType;

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", partnerCode);
        body.put("partnerName", partnerName);
        body.put("storeId", storeId);
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", redirectUrl);
        body.put("ipnUrl", ipnUrl);
        body.put("lang", "vi");
        body.put("requestType", requestType);
        body.put("autoCapture", true);
        body.put("extraData", extraData);
        body.put("signature", hmacSha256(rawData));

        JsonNode response;
        try {
            response = restClient.post()
                    .uri("/v2/gateway/api/create")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException exception) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Unable to reach MoMo payment gateway");
        }

        if (response == null) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Empty response from MoMo payment gateway");
        }
        int resultCode = response.path("resultCode").asInt(-1);
        String message = response.path("message").asText("MoMo payment initiation failed");
        String payUrl = response.path("payUrl").asText("");
        if (resultCode != 0 || payUrl.isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "MoMo rejected payment initiation: " + message);
        }

        String responseOrderId = response.path("orderId").asText(orderId);
        String responseRequestId = response.path("requestId").asText(requestId);
        if (!orderId.equals(responseOrderId) || !requestId.equals(responseRequestId)) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "MoMo response does not match payment request");
        }

        return new MomoCreateResult(orderId, requestId, payUrl);
    }

    public MomoRefundResult refundPayment(Payment payment, String orderId, String requestId) {
        requireConfigured();
        if (payment == null || payment.getBooking() == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Payment is not associated with a booking");
        }

        long amount = wholeVndAmount(payment.getAmount(), "Refund");
        if (amount < 1000) {
            throw new AppException(ErrorCode.BAD_REQUEST, "MoMo refund amount must be at least 1,000 VND");
        }

        long originalTransactionId;
        try {
            originalTransactionId = Long.parseLong(payment.getProviderTransactionId());
        } catch (NumberFormatException | NullPointerException exception) {
            throw new AppException(ErrorCode.BAD_REQUEST, "MoMo transaction id is missing or invalid");
        }

        String description = "Refund HotCinema booking " + payment.getBooking().getBookingCode();
        String rawData = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&description=" + description
                + "&orderId=" + orderId
                + "&partnerCode=" + partnerCode
                + "&requestId=" + requestId
                + "&transId=" + originalTransactionId;

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", partnerCode);
        body.put("orderId", orderId);
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("transId", originalTransactionId);
        body.put("lang", "vi");
        body.put("description", description);
        body.put("signature", hmacSha256(rawData));

        JsonNode response;
        try {
            response = restClient.post()
                    .uri("/v2/gateway/api/refund")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException exception) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Unable to reach MoMo refund gateway");
        }

        if (response == null) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Empty response from MoMo refund gateway");
        }

        int resultCode = response.path("resultCode").asInt(-1);
        String message = response.path("message").asText("MoMo refund failed");
        String responseOrderId = response.path("orderId").asText(orderId);
        String responseRequestId = response.path("requestId").asText(requestId);
        if (!orderId.equals(responseOrderId) || !requestId.equals(responseRequestId)) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "MoMo response does not match refund request");
        }
        if (resultCode != 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "MoMo rejected refund: " + message);
        }

        return new MomoRefundResult(
                responseOrderId,
                responseRequestId,
                response.path("transId").asText(""),
                message,
                response.toString()
        );
    }

    public String newProviderId(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "");
    }

    private long wholeVndAmount(java.math.BigDecimal amountValue, String operation) {
        try {
            return amountValue.longValueExact();
        } catch (ArithmeticException | NullPointerException exception) {
            throw new AppException(ErrorCode.BAD_REQUEST, operation + " requires a whole-number VND amount");
        }
    }

    private void requireConfigured() {
        if (partnerCode == null || partnerCode.isBlank()
                || accessKey == null || accessKey.isBlank()
                || secretKey == null || secretKey.isBlank()
                || redirectUrl == null || redirectUrl.isBlank()
                || ipnUrl == null || ipnUrl.isBlank()) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "MoMo payment gateway is not fully configured");
        }
    }

    private String hmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Unable to sign MoMo payment request");
        }
    }

    public record MomoCreateResult(String orderId, String requestId, String paymentUrl) {}

    public record MomoRefundResult(
            String orderId,
            String requestId,
            String refundTransactionId,
            String message,
            String responsePayload
    ) {}
}
