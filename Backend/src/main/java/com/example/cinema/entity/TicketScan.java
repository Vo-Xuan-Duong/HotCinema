package com.example.cinema.entity;

import com.example.cinema.entity.enums.TicketScanResult;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_scans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketScan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id")
    private Cinema cinema;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scanned_by")
    private User scannedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketScanResult result;

    @Column(name = "scanned_at", nullable = false)
    private ZonedDateTime scannedAt;

    @Column(name = "device_info", columnDefinition = "TEXT")
    private String deviceInfo;
}
