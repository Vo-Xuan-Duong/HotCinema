package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.booking.BookingCheckoutItemRequest;
import com.example.cinema.dto.booking.BookingCheckoutRequest;
import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.dto.booking.BookingUpdateRequest;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.BookingItem;
import com.example.cinema.entity.BookingPromotion;
import com.example.cinema.entity.BookingSeat;
import com.example.cinema.entity.CinemaProduct;
import com.example.cinema.entity.Promotion;
import com.example.cinema.entity.PromotionCode;
import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.entity.enums.ProductStatus;
import com.example.cinema.entity.enums.PromotionDiscountType;
import com.example.cinema.entity.enums.PromotionStatus;
import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingItemRepository;
import com.example.cinema.repository.BookingPromotionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.CinemaProductRepository;
import com.example.cinema.repository.PromotionCodeRepository;
import com.example.cinema.repository.ShowtimeRepository;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final BookingRepository repository;
    private final BookingMapper bookingMapper;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingItemRepository bookingItemRepository;
    private final CinemaProductRepository cinemaProductRepository;
    private final PromotionCodeRepository promotionCodeRepository;
    private final BookingPromotionRepository bookingPromotionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookingMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> findAllByUser(UUID userId) {
        return bookingMapper.toResponseList(
                repository.findAllByUser_IdAndIsActiveTrue(userId, Pageable.unpaged()).getContent()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(bookingMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> findPageByUser(UUID userId, Pageable pageable) {
        return PageMapper.toPageResponse(
                repository.findAllByUser_IdAndIsActiveTrue(userId, pageable).map(bookingMapper::toResponse)
        );
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookings", key = "#id")
    public BookingResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse findByIdForUser(UUID id, UUID userId) {
        return repository.findByIdAndUser_IdAndIsActiveTrue(id, userId)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse findByCode(String bookingCode) {
        return repository.findByBookingCodeIgnoreCaseAndIsActiveTrue(bookingCode)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingCode));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse findByCodeForUser(String bookingCode, UUID userId) {
        return repository.findByBookingCodeIgnoreCaseAndUser_IdAndIsActiveTrue(bookingCode, userId)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingCode));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"bookings", "showtimeseats", "cinemaproducts"}, allEntries = true)
    public BookingResponse checkout(UUID userId, BookingCheckoutRequest request) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        List<UUID> requestedSeatIds = request.getSeatIds();
        Set<UUID> uniqueSeatIds = new HashSet<>(requestedSeatIds);
        if (uniqueSeatIds.size() != requestedSeatIds.size()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Duplicate seats are not allowed");
        }

        List<UUID> orderedSeatIds = uniqueSeatIds.stream()
                .sorted(Comparator.comparing(UUID::toString))
                .toList();
        List<ShowtimeSeat> heldSeats = new ArrayList<>(orderedSeatIds.size());
        UUID showtimeId = null;
        ZonedDateTime expiresAt = null;
        BigDecimal seatAmount = BigDecimal.ZERO;
        ZonedDateTime now = ZonedDateTime.now();

        for (UUID seatId : orderedSeatIds) {
            ShowtimeSeat showtimeSeat = showtimeSeatRepository.findByIdForUpdate(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", seatId.toString()));

            UUID currentShowtimeId = showtimeSeat.getShowtime().getId();
            if (showtimeId == null) {
                showtimeId = currentShowtimeId;
            } else if (!showtimeId.equals(currentShowtimeId)) {
                throw new AppException(ErrorCode.BAD_REQUEST, "All selected seats must belong to the same showtime");
            }

            if (showtimeSeat.getStatus() != ShowtimeSeatStatus.HELD
                    || showtimeSeat.getHeldByUser() == null
                    || !userId.equals(showtimeSeat.getHeldByUser().getId())) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Selected seat is not held by the current user");
            }
            if (showtimeSeat.getHoldExpiresAt() == null || !showtimeSeat.getHoldExpiresAt().isAfter(now)) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Seat hold has expired");
            }
            if (showtimeSeat.getBooking() != null) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Selected seat already belongs to a booking");
            }

            seatAmount = seatAmount.add(showtimeSeat.getPrice());
            if (expiresAt == null || showtimeSeat.getHoldExpiresAt().isBefore(expiresAt)) {
                expiresAt = showtimeSeat.getHoldExpiresAt();
            }
            heldSeats.add(showtimeSeat);
        }

        UUID cinemaId = heldSeats.getFirst().getShowtime().getAuditorium().getCinema().getId();
        ConcessionReservation concessionReservation = reserveConcessions(request.getItems(), cinemaId);
        BigDecimal foodAmount = concessionReservation.totalAmount();
        BigDecimal subtotal = seatAmount.add(foodAmount).setScale(2, RoundingMode.HALF_UP);

        PromotionRedemption redemption = resolvePromotion(request.getPromotionCode(), subtotal, userId, now);
        BigDecimal discountAmount = redemption.discountAmount();
        BigDecimal totalAmount = subtotal.subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        Booking booking = Booking.builder()
                .bookingCode(generateBookingCode())
                .user(user)
                .showtime(heldSeats.getFirst().getShowtime())
                .customerName(user.getFullName())
                .customerEmail(user.getEmail())
                .customerPhone(user.getPhone())
                .status(BookingStatus.PENDING_PAYMENT)
                .seatAmount(seatAmount.setScale(2, RoundingMode.HALF_UP))
                .foodAmount(foodAmount)
                .discountAmount(discountAmount)
                .subtotal(subtotal)
                .totalAmount(totalAmount)
                .currency("VND")
                .expiresAt(expiresAt)
                .build();
        booking = repository.save(booking);

        List<BookingSeat> bookingSeats = new ArrayList<>(heldSeats.size());
        for (ShowtimeSeat showtimeSeat : heldSeats) {
            showtimeSeat.setBooking(booking);
            bookingSeats.add(BookingSeat.builder()
                    .booking(booking)
                    .showtimeSeat(showtimeSeat)
                    .seatName(showtimeSeat.getSeat().getDisplayName())
                    .seatTypeName(showtimeSeat.getSeat().getSeatType().getName())
                    .unitPrice(showtimeSeat.getPrice())
                    .createdAt(now)
                    .build());
        }
        showtimeSeatRepository.saveAll(heldSeats);
        bookingSeatRepository.saveAll(bookingSeats);

        if (!concessionReservation.items().isEmpty()) {
            List<BookingItem> bookingItems = concessionReservation.items().stream()
                    .map(item -> BookingItem.builder()
                            .booking(booking)
                            .product(item.cinemaProduct().getProduct())
                            .productName(item.cinemaProduct().getProduct().getName())
                            .quantity(item.quantity())
                            .unitPrice(item.cinemaProduct().getPrice())
                            .totalPrice(item.totalPrice())
                            .createdAt(now)
                            .build())
                    .toList();
            bookingItemRepository.saveAll(bookingItems);
        }

        if (redemption.promotionCode() != null) {
            PromotionCode promotionCode = redemption.promotionCode();
            promotionCode.setUsedCount((promotionCode.getUsedCount() == null ? 0 : promotionCode.getUsedCount()) + 1);
            promotionCodeRepository.save(promotionCode);
            bookingPromotionRepository.save(BookingPromotion.builder()
                    .booking(booking)
                    .promotion(redemption.promotion())
                    .promotionCode(promotionCode)
                    .discountAmount(discountAmount)
                    .createdAt(now)
                    .build());
        }

        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse create(BookingCreateRequest request) {
        Booking entity = bookingMapper.toEntity(request);
        applyRelations(entity, request.getUserId(), request.getShowtimeId());
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse createForUser(BookingCreateRequest request, UUID userId) {
        Booking entity = bookingMapper.toEntity(request);
        applyRelations(entity, userId, request.getShowtimeId());
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse update(UUID id, BookingUpdateRequest request) {
        Booking entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
        bookingMapper.updateEntityFromRequest(request, entity);
        applyRelations(entity, request.getUserId(), request.getShowtimeId());
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse updateStatus(UUID id, BookingStatus status) {
        Booking entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
        entity.setStatus(status);
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }

    private ConcessionReservation reserveConcessions(
            List<BookingCheckoutItemRequest> requestedItems,
            UUID cinemaId) {
        if (requestedItems == null || requestedItems.isEmpty()) {
            return ConcessionReservation.none();
        }

        Map<UUID, Integer> quantities = new HashMap<>();
        for (BookingCheckoutItemRequest item : requestedItems) {
            if (item == null || item.getCinemaProductId() == null || item.getQuantity() == null) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Concession item is invalid");
            }
            quantities.merge(item.getCinemaProductId(), item.getQuantity(), Integer::sum);
        }
        if (quantities.values().stream().anyMatch(quantity -> quantity <= 0 || quantity > 20)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Concession quantity must be between 1 and 20");
        }

        List<ReservedConcession> reserved = new ArrayList<>(quantities.size());
        BigDecimal total = BigDecimal.ZERO;
        for (UUID cinemaProductId : quantities.keySet().stream().sorted(Comparator.comparing(UUID::toString)).toList()) {
            int quantity = quantities.get(cinemaProductId);
            CinemaProduct cinemaProduct = cinemaProductRepository.findByIdForUpdate(cinemaProductId)
                    .orElseThrow(() -> new ResourceNotFoundException("CinemaProduct", cinemaProductId.toString()));

            if (cinemaProduct.getCinema() == null || !cinemaId.equals(cinemaProduct.getCinema().getId())) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Concession item does not belong to the booking cinema");
            }
            if (!Boolean.TRUE.equals(cinemaProduct.getIsAvailable())
                    || !cinemaProduct.isActive()
                    || cinemaProduct.getProduct() == null
                    || !cinemaProduct.getProduct().isActive()
                    || cinemaProduct.getProduct().getStatus() != ProductStatus.ACTIVE) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Concession item is not available");
            }
            if (cinemaProduct.getPrice() == null || cinemaProduct.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Concession item has an invalid price");
            }
            if (cinemaProduct.getStockQuantity() != null) {
                if (cinemaProduct.getStockQuantity() < quantity) {
                    throw new AppException(ErrorCode.BAD_REQUEST, "Concession item is out of stock");
                }
                cinemaProduct.setStockQuantity(cinemaProduct.getStockQuantity() - quantity);
                cinemaProductRepository.save(cinemaProduct);
            }

            BigDecimal lineTotal = cinemaProduct.getPrice()
                    .multiply(BigDecimal.valueOf(quantity))
                    .setScale(2, RoundingMode.HALF_UP);
            total = total.add(lineTotal);
            reserved.add(new ReservedConcession(cinemaProduct, quantity, lineTotal));
        }
        return new ConcessionReservation(reserved, total.setScale(2, RoundingMode.HALF_UP));
    }

    private PromotionRedemption resolvePromotion(String rawCode, BigDecimal subtotal, UUID userId, ZonedDateTime now) {
        if (rawCode == null || rawCode.isBlank()) {
            return PromotionRedemption.none();
        }

        String code = rawCode.trim().toUpperCase(Locale.ROOT);
        PromotionCode promotionCode = promotionCodeRepository.findByCodeForUpdate(code)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Promotion code is invalid"));
        if (!Boolean.TRUE.equals(promotionCode.getActive())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Promotion code is inactive");
        }
        int usedCount = promotionCode.getUsedCount() == null ? 0 : promotionCode.getUsedCount();
        if (promotionCode.getUsageLimit() != null && usedCount >= promotionCode.getUsageLimit()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Promotion code usage limit has been reached");
        }

        Promotion promotion = promotionCode.getPromotion();
        if (promotion == null
                || !promotion.isActive()
                || promotion.getStatus() != PromotionStatus.ACTIVE
                || now.isBefore(promotion.getStartAt())
                || now.isAfter(promotion.getEndAt())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Promotion is not active");
        }
        if (subtotal.compareTo(promotion.getMinimumOrderAmount()) < 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Booking does not meet the promotion minimum amount");
        }
        if (promotion.getUsageLimit() != null
                && bookingPromotionRepository.countByPromotion_Id(promotion.getId()) >= promotion.getUsageLimit()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Promotion usage limit has been reached");
        }
        if (promotion.getUsagePerUser() != null
                && bookingPromotionRepository.countByPromotion_IdAndBooking_User_Id(promotion.getId(), userId)
                >= promotion.getUsagePerUser()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Promotion usage limit for this user has been reached");
        }

        BigDecimal discount = promotion.getDiscountType() == PromotionDiscountType.PERCENTAGE
                ? subtotal.multiply(promotion.getDiscountValue()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
                : promotion.getDiscountValue();
        if (promotion.getMaxDiscountAmount() != null) {
            discount = discount.min(promotion.getMaxDiscountAmount());
        }
        discount = discount.min(subtotal).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        return new PromotionRedemption(promotionCode, promotion, discount);
    }

    private String generateBookingCode() {
        return "HC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase(Locale.ROOT);
    }

    private void applyRelations(Booking entity, UUID userId, UUID showtimeId) {
        if (userId == null) {
            entity.setUser(null);
        } else {
            entity.setUser(userRepository.findByIdAndIsActiveTrue(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString())));
        }

        entity.setShowtime(showtimeRepository.findByIdAndIsActiveTrue(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", showtimeId.toString())));
    }

    private record ReservedConcession(CinemaProduct cinemaProduct, int quantity, BigDecimal totalPrice) {}

    private record ConcessionReservation(List<ReservedConcession> items, BigDecimal totalAmount) {
        private static ConcessionReservation none() {
            return new ConcessionReservation(List.of(), BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }
    }

    private record PromotionRedemption(PromotionCode promotionCode, Promotion promotion, BigDecimal discountAmount) {
        private static PromotionRedemption none() {
            return new PromotionRedemption(null, null, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        }
    }
}
