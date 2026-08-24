package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.ticketscan.TicketScanCreateRequest;
import com.example.cinema.dto.ticketscan.TicketScanResponse;
import com.example.cinema.dto.ticketscan.TicketScanUpdateRequest;
import com.example.cinema.entity.Cinema;
import com.example.cinema.entity.Showtime;
import com.example.cinema.entity.Ticket;
import com.example.cinema.entity.TicketScan;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.TicketScanResult;
import com.example.cinema.entity.enums.TicketStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.TicketScanMapper;
import com.example.cinema.repository.CinemaRepository;
import com.example.cinema.repository.EmployeeCinemaRepository;
import com.example.cinema.repository.TicketRepository;
import com.example.cinema.repository.TicketScanRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.TicketScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketScanServiceImpl implements TicketScanService {

    private final TicketScanRepository repository;
    private final TicketScanMapper ticketScanMapper;
    private final TicketRepository ticketRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRepository userRepository;
    private final EmployeeCinemaRepository employeeCinemaRepository;

    @Value("${app.ticket.scan-early-minutes:60}")
    private long scanEarlyMinutes;

    @Value("${app.ticket.scan-grace-minutes:30}")
    private long scanGraceMinutes;

    @Override
    @Transactional(readOnly = true)
    public List<TicketScanResponse> findAll() {
        return ticketScanMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketScanResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(ticketScanMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "ticketscans", key = "#id")
    public TicketScanResponse findById(UUID id) {
        return repository.findById(id)
                .map(ticketScanMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("TicketScan", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"ticketscans", "tickets"}, allEntries = true)
    public TicketScanResponse scan(UUID qrToken, UUID cinemaId, UUID scannedById, String deviceInfo, boolean admin) {
        Cinema cinema = cinemaRepository.findByIdAndIsActiveTrue(cinemaId)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", cinemaId.toString()));
        User scanner = userRepository.findByIdAndIsActiveTrue(scannedById)
                .orElseThrow(() -> new ResourceNotFoundException("User", scannedById.toString()));

        if (!admin && !employeeCinemaRepository.existsByUser_IdAndCinema_IdAndIsActiveTrue(scannedById, cinemaId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Scanner is not assigned to this cinema");
        }

        ZonedDateTime now = ZonedDateTime.now();
        Ticket ticket = ticketRepository.findForUpdateByQrTokenAndIsActiveTrue(qrToken).orElse(null);
        TicketScanResult result = evaluate(ticket, cinemaId, now);

        if (result == TicketScanResult.SUCCESS) {
            ticket.setStatus(TicketStatus.USED);
            ticket.setCheckedInAt(now);
            ticket.setCheckedInBy(scanner);
            ticketRepository.save(ticket);
        }

        TicketScan scan = TicketScan.builder()
                .ticket(ticket)
                .cinema(cinema)
                .scannedBy(scanner)
                .result(result)
                .scannedAt(now)
                .deviceInfo(deviceInfo)
                .build();
        return ticketScanMapper.toResponse(repository.save(scan));
    }

    @Override
    @Transactional
    @CacheEvict(value = "ticketscans", allEntries = true)
    public TicketScanResponse create(TicketScanCreateRequest request) {
        TicketScan entity = ticketScanMapper.toEntity(request);
        return ticketScanMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "ticketscans", allEntries = true)
    public TicketScanResponse update(UUID id, TicketScanUpdateRequest request) {
        TicketScan entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketScan", id.toString()));
        ticketScanMapper.updateEntityFromRequest(request, entity);
        return ticketScanMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "ticketscans", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    private TicketScanResult evaluate(Ticket ticket, UUID cinemaId, ZonedDateTime now) {
        if (ticket == null) {
            return TicketScanResult.INVALID;
        }
        if (ticket.getStatus() == TicketStatus.USED) {
            return TicketScanResult.ALREADY_USED;
        }
        if (ticket.getStatus() != TicketStatus.VALID) {
            return TicketScanResult.INVALID;
        }
        if (ticket.getBooking() == null || ticket.getBooking().getShowtime() == null) {
            return TicketScanResult.INVALID;
        }

        Showtime showtime = ticket.getBooking().getShowtime();
        if (showtime.getAuditorium() == null
                || showtime.getAuditorium().getCinema() == null
                || !cinemaId.equals(showtime.getAuditorium().getCinema().getId())) {
            return TicketScanResult.WRONG_CINEMA;
        }
        if (showtime.getStartTime() != null && now.isBefore(showtime.getStartTime().minusMinutes(scanEarlyMinutes))) {
            return TicketScanResult.TOO_EARLY;
        }
        if (showtime.getEndTime() != null && now.isAfter(showtime.getEndTime().plusMinutes(scanGraceMinutes))) {
            return TicketScanResult.EXPIRED;
        }
        return TicketScanResult.SUCCESS;
    }
}
