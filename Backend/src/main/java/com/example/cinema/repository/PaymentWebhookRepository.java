package com.example.cinema.repository;

import com.example.cinema.entity.PaymentWebhook;
import com.example.cinema.entity.enums.PaymentProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentWebhookRepository extends JpaRepository<PaymentWebhook, UUID> {

    Optional<PaymentWebhook> findByProviderAndExternalEventId(
            PaymentProvider provider,
            String externalEventId
    );
}
