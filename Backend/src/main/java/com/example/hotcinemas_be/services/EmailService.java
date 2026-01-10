package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.UserRepository;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${spring.mail.username}")
    private String systemEmail;

    private final JavaMailSender javaMailSender;
    private final UserRepository userRepository;

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
            helper.setFrom(systemEmail); // Set your email address here
            javaMailSender.send(mimeMessage);
            log.info("OTP confirmation email sent to {}", email);

        } catch (Exception e) {
            log.error("Failed to send OTP confirmation email to {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void sendErrorToAdminEmail(String emailAdmin ,  String subject, String errorDetails) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(emailAdmin);
            helper.setSubject("Error Alert: " + subject);
            String content = "<html><body>" +
                    "<h2>Error Alert</h2>" +
                    "<p>Details:</p>" +
                    "<pre>" + errorDetails + "</pre>" +
                    "</body></html>";
            helper.setText(content, true); // true indicates HTML content
            helper.setFrom(systemEmail); // Set your email address here
            javaMailSender.send(mimeMessage);
            log.info("Error alert email sent to admin");
        } catch (Exception e) {
            log.error("Failed to send error alert email to admin: {}", e.getMessage());
        }
    }

    public void sendMailToAdmin(String subject, String errorDetails) {
        List<User> admins = userRepository.findUsersByRole_Name("ADMIN", Pageable.ofSize(10)).getContent();

        admins.forEach(admin -> {
            sendErrorToAdminEmail(admin.getEmail(), subject, errorDetails);
        });


    }
}
