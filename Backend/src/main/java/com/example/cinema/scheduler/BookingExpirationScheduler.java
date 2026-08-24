package com.example.cinema.scheduler;

import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.service.ShowtimeSeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BookingExpirationScheduler {

    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final ShowtimeSeatService showtimeSeatService;

    @Scheduled(fixedDelayString = "${app.booking.expiration-sweep-ms:30000}")
    public void expireDueHolds() {
        List<UUID> showtimeIds = showtimeSeatRepository.findShowtimeIdsWithExpiredHolds(
                ShowtimeSeatStatus.HELD,
                ZonedDateTime.now()
        );
        for (UUID showtimeId : showtimeIds) {
            showtimeSeatService.findByShowtime(showtimeId);
        }
    }
}
