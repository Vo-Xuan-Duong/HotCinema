package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.revenue.requests.RevenueFilterRequest;
import com.example.hotcinemas_be.dtos.revenue.responses.*;
import com.example.hotcinemas_be.enums.PaymentStatus;
import com.example.hotcinemas_be.models.Payment;
import com.example.hotcinemas_be.repositorys.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RevenueService {

    private final PaymentRepository paymentRepository;

    /**
     * Get revenue summary for a date range
     */
    public RevenueSummaryResponse getRevenueSummary(LocalDate startDate, LocalDate endDate) {
        log.info("Getting revenue summary from {} to {}", startDate, endDate);

        List<Payment> payments = paymentRepository.findByPaymentDateBetween(
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59));

        List<Payment> successfulPayments = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .toList();

        BigDecimal totalRevenue = successfulPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalBookings = successfulPayments.stream()
                .map(p -> p.getBooking().getId())
                .distinct()
                .count();

        long totalTickets = successfulPayments.stream()
                .map(p -> p.getBooking().getBookingSeats())
                .mapToLong(List::size)
                .sum();

        long successCount = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .count();

        long pendingCount = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING)
                .count();

        long failedCount = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.FAILED)
                .count();

        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        BigDecimal averageRevenuePerDay = daysBetween > 0
                ? totalRevenue.divide(BigDecimal.valueOf(daysBetween), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal averageBookingValue = totalBookings > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalBookings), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return RevenueSummaryResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalRevenue(totalRevenue)
                .averageRevenuePerDay(averageRevenuePerDay)
                .totalBookings(totalBookings)
                .totalTickets(totalTickets)
                .totalSuccessfulPayments(successCount)
                .totalPendingPayments(pendingCount)
                .totalFailedPayments(failedCount)
                .averageBookingValue(averageBookingValue)
                .build();
    }

    /**
     * Get revenue by date
     */
    public List<RevenueByDateResponse> getRevenueByDate(LocalDate startDate, LocalDate endDate) {
        log.info("Getting revenue by date from {} to {}", startDate, endDate);

        List<Payment> payments = paymentRepository.findByPaymentDateBetweenAndPaymentStatus(
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59),
                PaymentStatus.SUCCESS);

        Map<LocalDate, List<Payment>> paymentsByDate = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getPaymentDate().toLocalDate()));

        List<RevenueByDateResponse> result = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<Payment> datePayments = paymentsByDate.getOrDefault(currentDate, new ArrayList<>());

            BigDecimal totalRevenue = datePayments.stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long totalBookings = datePayments.stream()
                    .map(p -> p.getBooking().getId())
                    .distinct()
                    .count();

            long totalTickets = datePayments.stream()
                    .map(p -> p.getBooking().getBookingSeats())
                    .mapToLong(List::size)
                    .sum();

            result.add(RevenueByDateResponse.builder()
                    .date(currentDate)
                    .totalRevenue(totalRevenue)
                    .totalBookings(totalBookings)
                    .totalTickets(totalTickets)
                    .build());

            currentDate = currentDate.plusDays(1);
        }

        return result;
    }

    /**
     * Get revenue by movie
     */
    public List<RevenueByMovieResponse> getRevenueByMovie(RevenueFilterRequest filter, int limit) {
        log.info("Getting revenue by movie with filter: {}", filter);

        List<Payment> payments = getFilteredPayments(filter);

        Map<Long, List<Payment>> paymentsByMovie = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getBooking().getShowtime().getMovie().getId()));

        return paymentsByMovie.entrySet().stream()
                .map(entry -> {
                    Long movieId = entry.getKey();
                    List<Payment> moviePayments = entry.getValue();

                    var movie = moviePayments.getFirst().getBooking().getShowtime().getMovie();

                    BigDecimal totalRevenue = moviePayments.stream()
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    long totalBookings = moviePayments.stream()
                            .map(p -> p.getBooking().getId())
                            .distinct()
                            .count();

                    long totalTickets = moviePayments.stream()
                            .map(p -> p.getBooking().getBookingSeats())
                            .mapToLong(List::size)
                            .sum();

                    return RevenueByMovieResponse.builder()
                            .movieId(movieId)
                            .movieTitle(movie.getTitle())
                            .posterUrl(movie.getPosterUrl())
                            .totalRevenue(totalRevenue)
                            .totalBookings(totalBookings)
                            .totalTickets(totalTickets)
                            .build();
                })
                .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .limit(limit > 0 ? limit : Integer.MAX_VALUE)
                .collect(Collectors.toList());
    }

    /**
     * Get revenue by cinema
     */
    public List<RevenueByCinemaResponse> getRevenueByCinema(RevenueFilterRequest filter, int limit) {
        log.info("Getting revenue by cinema with filter: {}", filter);

        List<Payment> payments = getFilteredPayments(filter);

        Map<Long, List<Payment>> paymentsByCinema = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getBooking().getShowtime().getTheater().getCinema().getId()));

        return paymentsByCinema.entrySet().stream()
                .map(entry -> {
                    Long cinemaId = entry.getKey();
                    List<Payment> cinemaPayments = entry.getValue();

                    var cinema = cinemaPayments.getFirst().getBooking().getShowtime().getTheater().getCinema();

                    BigDecimal totalRevenue = cinemaPayments.stream()
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    long totalBookings = cinemaPayments.stream()
                            .map(p -> p.getBooking().getId())
                            .distinct()
                            .count();

                    long totalTickets = cinemaPayments.stream()
                            .map(p -> p.getBooking().getBookingSeats())
                            .mapToLong(List::size)
                            .sum();

                    return RevenueByCinemaResponse.builder()
                            .cinemaId(cinemaId)
                            .cinemaName(cinema.getName())
                            .cityName(cinema.getRegion() != null ? cinema.getRegion().getName() : "N/A")
                            .totalRevenue(totalRevenue)
                            .totalBookings(totalBookings)
                            .totalTickets(totalTickets)
                            .build();
                })
                .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .limit(limit > 0 ? limit : Integer.MAX_VALUE)
                .collect(Collectors.toList());
    }

    public List<RevenueByPaymentMethodResponse> getRevenueByPaymentMethod(LocalDate startDate, LocalDate endDate) {
        log.info("Getting revenue by payment method from {} to {}", startDate, endDate);

        List<Payment> payments = paymentRepository.findByPaymentDateBetweenAndPaymentStatus(
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59),
                PaymentStatus.SUCCESS);

        Map<com.example.hotcinemas_be.enums.PaymentMethod, List<Payment>> paymentsByMethod = payments.stream()
                .collect(Collectors.groupingBy(Payment::getPaymentMethod));

        return paymentsByMethod.entrySet().stream()
                .map(entry -> {
                    BigDecimal totalRevenue = entry.getValue().stream()
                            .map(Payment::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return RevenueByPaymentMethodResponse.builder()
                            .paymentMethod(entry.getKey())
                            .totalRevenue(totalRevenue)
                            .totalTransactions((long) entry.getValue().size())
                            .build();
                })
                .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .collect(Collectors.toList());
    }

    /**
     * Get top performing movies by revenue
     */
    public List<RevenueByMovieResponse> getTopMoviesByRevenue(LocalDate startDate, LocalDate endDate, int limit) {
        RevenueFilterRequest filter = RevenueFilterRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();
        return getRevenueByMovie(filter, limit);
    }

    /**
     * Get top performing cinemas by revenue
     */
    public List<RevenueByCinemaResponse> getTopCinemasByRevenue(LocalDate startDate, LocalDate endDate, int limit) {
        RevenueFilterRequest filter = RevenueFilterRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();
        return getRevenueByCinema(filter, limit);
    }

    private List<Payment> getFilteredPayments(RevenueFilterRequest filter) {
        LocalDate startDate = filter.getStartDate() != null ? filter.getStartDate() : LocalDate.now().minusMonths(1);
        LocalDate endDate = filter.getEndDate() != null ? filter.getEndDate() : LocalDate.now();
        PaymentStatus status = filter.getPaymentStatus() != null ? filter.getPaymentStatus() : PaymentStatus.SUCCESS;

        List<Payment> payments = paymentRepository.findByPaymentDateBetweenAndPaymentStatus(
                startDate.atStartOfDay(),
                endDate.atTime(23, 59, 59),
                status);

        // Apply additional filters
        if (filter.getMovieId() != null) {
            payments = payments.stream()
                    .filter(p -> p.getBooking().getShowtime().getMovie().getId().equals(filter.getMovieId()))
                    .collect(Collectors.toList());
        }

        if (filter.getCinemaId() != null) {
            payments = payments.stream()
                    .filter(p -> p.getBooking().getShowtime().getTheater().getCinema().getId()
                            .equals(filter.getCinemaId()))
                    .collect(Collectors.toList());
        }

        if (filter.getPaymentMethod() != null) {
            payments = payments.stream()
                    .filter(p -> p.getPaymentMethod() == filter.getPaymentMethod())
                    .collect(Collectors.toList());
        }

        return payments;
    }
}
