package com.example.hotcinemas_be.aop;

import com.example.hotcinemas_be.models.AuditLog;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.UserRepository;
import com.example.hotcinemas_be.services.AuditLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.text.MessageFormat;
import java.util.Optional;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogAspect {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    @AfterReturning(pointcut = "@annotation(logAudit)", returning = "result")
    public void logActivity(JoinPoint joinPoint, LogAudit logAudit, Object result) {
        try {
            // Get Current User
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = null;
            if (authentication != null && authentication.isAuthenticated()
                    && !authentication.getPrincipal().equals("anonymousUser")) {
                String email = authentication.getName();
                Optional<User> userOptional = userRepository.findByEmail(email);
                if (userOptional.isPresent()) {
                    user = userOptional.get();
                }
            }

            // Get Request Details
            String ipAddress = "Unknown";
            String userAgent = "Unknown";

            try {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                        .getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    ipAddress = request.getRemoteAddr();
                    if (request.getHeader("X-Forwarded-For") != null) {
                        ipAddress = request.getHeader("X-Forwarded-For");
                    }
                    userAgent = request.getHeader("User-Agent");
                }
            } catch (Exception e) {
                // Ignore if not in web context
            }

            // Format Description
            String description = logAudit.description();
            try {
                if (description.contains("{")) {
                    description = MessageFormat.format(description, joinPoint.getArgs());
                }
            } catch (Exception e) {
                log.warn("Failed to format audit log description: {}", e.getMessage());
            }

            // Build Audit Log
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(logAudit.action())
                    .description(description)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .tableName(logAudit.tableName())
                    .build();

            auditLogService.saveAuditLog(auditLog);

        } catch (Exception e) {
            log.error("Error creating audit log", e);
        }
    }
}
