package com.example.hotcinemas_be.models;

import java.time.LocalDateTime;

import com.example.hotcinemas_be.enums.LoginStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "login_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "email", length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "login_status", nullable = false, length = 20)
    private LoginStatus loginStatus;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "device_type", length = 50)
    private String deviceType;

    @Column(name = "browser", length = 50)
    private String browser;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "fail_reason", length = 255)
    private String failReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}

