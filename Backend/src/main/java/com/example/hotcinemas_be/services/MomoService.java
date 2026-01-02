package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.momo.MomoIpnRequest;
import com.example.hotcinemas_be.dtos.momo.MomoRequest;
import com.example.hotcinemas_be.dtos.momo.MomoResponse;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MomoService {

    @Value("${momo.partnerCode}")
    private String PARTNER_CODE;
    @Value("${momo.partnerName}")
    private String PARTNER_NAME;
    @Value("${momo.accessKey}")
    private String ACCESS_KEY;
    @Value("${momo.secretKey}")
    private String SECRET_KEY;
    @Value("${momo.redirectUrl}")
    private String REDIRECT_URL;
    @Value("${momo.ipnUrl}")
    private String IPN_URL;
    @Value("${momo.endPoint}")
    private String ENDPOINT;

    private final RestTemplate restTemplate;

    public MomoResponse createMethodMomo(String orderId, long amount, String orderInfo) {
        String requestId = UUID.randomUUID().toString();
        String extraData = "";

        final String REQUEST_TYPE = "captureWallet";

        String rawSignature = "accessKey=" + ACCESS_KEY + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + IPN_URL + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + PARTNER_CODE + "&redirectUrl=" + REDIRECT_URL + "&requestId=" + requestId + "&requestType=" + REQUEST_TYPE;

        String signature = hmacSHA256(rawSignature, SECRET_KEY);

        MomoRequest req = MomoRequest.builder()
                .partnerCode(PARTNER_CODE)
                .requestId(requestId)
                .amount(String.valueOf(amount))
                .orderId(orderId)
                .orderInfo(orderInfo)
                .redirectUrl(REDIRECT_URL)
                .ipnUrl(IPN_URL)
                .requestType(REQUEST_TYPE)
                .extraData(extraData)
                .lang("vi")
                .signature(signature)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<MomoResponse> resp = restTemplate.postForEntity(ENDPOINT, new HttpEntity<>(req, headers),
                MomoResponse.class);

        if(log.isDebugEnabled()) {
            log.debug("[MoMo] Request: {}", req);
            log.debug("[MoMo] Response: {}", resp);
        }

        return resp.getBody();
    }

    public String hmacSHA256(String raw, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new AppException("HMAC error", ErrorCode.PAYMENT_FAILED);
        }
    }

    public boolean verifyIpnSignature(MomoIpnRequest ipn, String secretKey) {
        String raw = buildRawSignatureForIpn(ipn);
        String expected = hmacSHA256(raw, secretKey);
        return expected.equalsIgnoreCase(ipn.getSignature());
    }

    public String buildRawSignatureForIpn(MomoIpnRequest ipn) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("amount", ipn.getAmount());
        map.put("extraData", ipn.getExtraData());
        map.put("message", ipn.getMessage());
        map.put("orderId", ipn.getOrderId());
        map.put("orderInfo", ipn.getOrderInfo());
        map.put("orderType", ipn.getOrderType());
        map.put("partnerCode", ipn.getPartnerCode());
        map.put("payType", ipn.getPayType());
        map.put("requestId", ipn.getRequestId());
        map.put("responseTime", ipn.getResponseTime());
        map.put("resultCode", ipn.getResultCode());
        map.put("transId", ipn.getTransId());

        List<String> keys = new ArrayList<>(map.keySet());
        Collections.sort(keys);

        return keys.stream()
                .map(k -> k + "=" + urlEncode(String.valueOf(map.get(k))))
                .collect(Collectors.joining("&"));
    }

    private String urlEncode(String s) {
        try {
            return URLEncoder.encode(s, StandardCharsets.UTF_8)
                    .replace("+", "%20");
        } catch (Exception e) {
            return s;
        }
    }

    public String buildRawSignatureForIpnStrict(MomoIpnRequest ipn, String accessKey) {
        String extraData = ipn.getExtraData() == null ? "" : ipn.getExtraData();
        String message = ipn.getMessage() == null ? "" : ipn.getMessage();
        String orderInfo = ipn.getOrderInfo() == null ? "" : ipn.getOrderInfo();

        return "accessKey=" + accessKey + "&amount=" + ipn.getAmount() + "&extraData=" + extraData + "&message=" + message + "&orderId=" + ipn.getOrderId() + "&orderInfo=" + orderInfo + "&orderType=" + ipn.getOrderType() + "&partnerCode=" + ipn.getPartnerCode() + "&payType=" + ipn.getPayType() + "&requestId=" + ipn.getRequestId() + "&responseTime=" + ipn.getResponseTime() + "&resultCode=" + ipn.getResultCode() + "&transId=" + ipn.getTransId();
    }

    public boolean verifyIpnSignatureStrict(MomoIpnRequest ipn, String accessKey, String secretKey) {
        String raw = buildRawSignatureForIpnStrict(ipn, accessKey);
        String expected = hmacSHA256(raw, secretKey);
        if (log.isDebugEnabled()) {
            log.debug("[MoMo IPN] raw(strict)={}", raw);
            log.debug("[MoMo IPN] expected(strict)={}", expected);
            log.debug("[MoMo IPN] provided       ={}", ipn.getSignature());
        }
        return ipn.getSignature() != null && ipn.getSignature().equalsIgnoreCase(expected);
    }

    public boolean verifyIpn(MomoIpnRequest ipn) {
        return verifyIpnSignatureStrict(ipn, ACCESS_KEY, SECRET_KEY);
    }
}
