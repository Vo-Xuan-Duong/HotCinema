package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.momo.MomoIpnRequest;
import com.example.hotcinemas_be.dtos.momo.MomoResponse;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

@Slf4j
@Disabled("Manual E2E test. Requires explicit MoMo test credentials via environment variables.")
public class MomoServiceE2ETest {

    private MomoService momoService;

    @BeforeEach
    public void setUp() {
        momoService = new MomoService(new RestTemplate());
        ReflectionTestUtils.setField(momoService, "PARTNER_CODE", System.getenv("MOMO_PARTNER_CODE"));
        ReflectionTestUtils.setField(momoService, "PARTNER_NAME", System.getenv("MOMO_PARTNER_NAME"));
        ReflectionTestUtils.setField(momoService, "ACCESS_KEY", System.getenv("MOMO_ACCESS_KEY"));
        ReflectionTestUtils.setField(momoService, "SECRET_KEY", System.getenv("MOMO_SECRET_KEY"));
        ReflectionTestUtils.setField(momoService, "ENDPOINT", System.getenv("MOMO_ENDPOINT"));
        ReflectionTestUtils.setField(momoService, "REDIRECT_URL", System.getenv("MOMO_REDIRECT_URL"));
        ReflectionTestUtils.setField(momoService, "IPN_URL", System.getenv("MOMO_IPN_URL"));
    }

    @Test
    public void testCreatePaymentE2E() {
        String orderId = "TEST_ORDER_" + System.currentTimeMillis();
        long amount = 50000;
        String orderInfo = "Test payment " + orderId;

        log.info("Testing MoMo payment creation for order: {}", orderId);
        MomoResponse response = momoService.createMethodMomo(orderId, amount, orderInfo);

        assertNotNull(response);
        log.info("==============================================");
        log.info("MoMo Response received!");
        log.info("Result Code: {}", response.getResultCode());
        log.info("Message: {}", response.getMessage());
        log.info("Pay URL (CLICK THIS TO TEST): {}", response.getPayUrl());
        log.info("==============================================");

        assertNotNull(response.getPayUrl(), "Pay URL should not be null. Check the MoMo endpoint and credentials.");
    }

    @Test
    public void testVerifyIpnSignature() {
        String partnerCode = System.getenv("MOMO_PARTNER_CODE");
        String orderId = "TEST_ORDER_123";
        String requestId = "REQ_123";
        long amount = 50000L;
        String orderInfo = "Test payment";
        String orderType = "momo_wallet";
        String transId = "123456789";
        int resultCode = 0;
        String message = "Success";
        String payType = "qr";
        long responseTime = System.currentTimeMillis();
        String extraData = "";

        MomoIpnRequest ipnWithoutSig = new MomoIpnRequest(
                partnerCode, orderId, requestId, amount, orderInfo, orderType, transId,
                resultCode, message, payType, responseTime, extraData, ""
        );

        String accessKey = System.getenv("MOMO_ACCESS_KEY");
        String secretKey = System.getenv("MOMO_SECRET_KEY");
        String rawSignature = momoService.buildRawSignatureForIpnStrict(ipnWithoutSig, accessKey);
        String signature = momoService.hmacSHA256(rawSignature, secretKey);

        MomoIpnRequest validIpn = new MomoIpnRequest(
                partnerCode, orderId, requestId, amount, orderInfo, orderType, transId,
                resultCode, message, payType, responseTime, extraData, signature
        );

        log.info("Testing MoMo IPN Signature Verification...");
        log.info("Generated Signature: {}", signature);
        
        boolean isValid = momoService.verifyIpn(validIpn);
        assertTrue(isValid, "The IPN signature should be valid.");
        log.info("IPN verification PASSED!");
    }
}
