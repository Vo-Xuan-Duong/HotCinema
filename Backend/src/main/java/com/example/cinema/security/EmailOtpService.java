package com.example.cinema.security;

import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class EmailOtpService {

    private static final String EMAIL_VERIFICATION_PURPOSE = "email-verification";
    private static final String PASSWORD_RESET_PURPOSE = "password-reset";
    private static final String OTP_KEY_PREFIX = "auth:otp:";
    private static final String ATTEMPT_KEY_PREFIX = "auth:otp-attempts:";
    private static final int MAX_ATTEMPTS = 5;

    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Duration otpTtl;
    private final String mailFrom;

    public EmailOtpService(
            StringRedisTemplate redisTemplate,
            JavaMailSender mailSender,
            @Value("${app.security.otp.ttl-seconds:300}") long ttlSeconds,
            @Value("${spring.mail.username:no-reply@hotcinema.local}") String mailFrom
    ) {
        this.redisTemplate = redisTemplate;
        this.mailSender = mailSender;
        this.otpTtl = Duration.ofSeconds(ttlSeconds);
        this.mailFrom = mailFrom;
    }

    public void issue(String email) {
        issue(email, EMAIL_VERIFICATION_PURPOSE, "HotCinema - Verify your email",
                "Your HotCinema verification code is: ");
    }

    public void issuePasswordReset(String email) {
        issue(email, PASSWORD_RESET_PURPOSE, "HotCinema - Reset your password",
                "Your HotCinema password reset code is: ");
    }

    private void issue(String email, String purpose, String subject, String bodyPrefix) {
        String normalizedEmail = normalize(email);
        String otp = "%06d".formatted(secureRandom.nextInt(1_000_000));

        redisTemplate.opsForValue().set(otpKey(purpose, normalizedEmail), hash(purpose, normalizedEmail, otp), otpTtl);
        redisTemplate.delete(attemptKey(purpose, normalizedEmail));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(normalizedEmail);
        message.setSubject(subject);
        message.setText(bodyPrefix + otp
                + "\nThis code expires in " + otpTtl.toMinutes() + " minutes.");
        mailSender.send(message);
    }

    public void verify(String email, String otp) {
        verify(email, otp, EMAIL_VERIFICATION_PURPOSE);
    }

    public void verifyPasswordReset(String email, String otp) {
        verify(email, otp, PASSWORD_RESET_PURPOSE, true);
    }

    public void validatePasswordReset(String email, String otp) {
        verify(email, otp, PASSWORD_RESET_PURPOSE, false);
    }

    private void verify(String email, String otp, String purpose) {
        verify(email, otp, purpose, true);
    }

    private void verify(String email, String otp, String purpose, boolean consume) {
        String normalizedEmail = normalize(email);
        String key = otpKey(purpose, normalizedEmail);
        String expectedHash = redisTemplate.opsForValue().get(key);

        if (expectedHash == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "OTP is invalid or has expired");
        }

        Long attempts = redisTemplate.opsForValue().increment(attemptKey(purpose, normalizedEmail));
        redisTemplate.expire(attemptKey(purpose, normalizedEmail), otpTtl);
        if (attempts != null && attempts > MAX_ATTEMPTS) {
            redisTemplate.delete(key);
            throw new AppException(ErrorCode.BAD_REQUEST, "Too many invalid OTP attempts");
        }

        if (!MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.UTF_8),
                hash(purpose, normalizedEmail, otp).getBytes(StandardCharsets.UTF_8)
        )) {
            throw new AppException(ErrorCode.BAD_REQUEST, "OTP is invalid or has expired");
        }

        if (consume) {
            redisTemplate.delete(key);
            redisTemplate.delete(attemptKey(purpose, normalizedEmail));
        }
    }

    private String hash(String purpose, String email, String otp) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest((purpose + ':' + email + ':' + otp).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String otpKey(String purpose, String email) {
        return OTP_KEY_PREFIX + purpose + ':' + email;
    }

    private String attemptKey(String purpose, String email) {
        return ATTEMPT_KEY_PREFIX + purpose + ':' + email;
    }
}
