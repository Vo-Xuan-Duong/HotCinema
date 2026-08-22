package com.example.cinema.entity;

import com.example.cinema.entity.enums.PaymentProvider;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_webhooks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentWebhook {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentProvider provider;

    @Column(name = "external_event_id", length = 255)
    private String externalEventId;

    @Column(nullable = false, columnDefinition = "JSON")
    private String payload;

    @Column(columnDefinition = "TEXT")
    private String signature;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(nullable = false)
    private Boolean processed = false;

    @Column(name = "processed_at")
    private ZonedDateTime processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
}
