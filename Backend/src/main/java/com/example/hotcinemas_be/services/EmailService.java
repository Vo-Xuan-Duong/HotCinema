package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    private final JavaMailSender javaMailSender;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Async
    public void sendOTPConfirmationEmail(String email, String otp) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("OTP Confirmation");
            String content = "<html><body>" +
                    "<h2>OTP Confirmation</h2>" +
                    "<p>Your OTP is: <strong>" + otp + "</strong></p>" +
                    "<p>Please use this OTP to complete your registration.</p>" +
                    "</body></html>";
            helper.setText(content, true); // true indicates HTML content
            helper.setFrom("duongvo.261104@gmail.com"); // Set your email address here
            javaMailSender.send(mimeMessage);
            log.info("OTP confirmation email sent to {}", email);

        } catch (Exception e) {
            log.error("Failed to send OTP confirmation email to {}: {}", email, e.getMessage());
        }
    }
}
