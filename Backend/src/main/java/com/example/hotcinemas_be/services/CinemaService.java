package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.cinema.requests.CinemaRequest;
import com.example.hotcinemas_be.dtos.cinema.responses.CinemaResponse;
import com.example.hotcinemas_be.dtos.common.PageResponse;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.mappers.CinemaMapper;
import com.example.hotcinemas_be.mappers.PageMapper;
import com.example.hotcinemas_be.models.Cinema;
import com.example.hotcinemas_be.models.Region;
import com.example.hotcinemas_be.repositorys.CinemaRepository;
import com.example.hotcinemas_be.repositorys.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CinemaService {

    private final CinemaMapper cinemaMapper;
    private final CinemaRepository cinemaRepository;
    private final RegionRepository regionRepository;
    private final PageMapper pageMapper;


    @Caching(evict = {
            @CacheEvict(value = "cinema", allEntries = true),
            @CacheEvict(value = "cinemas-page", allEntries = true),
            @CacheEvict(value = "cinemas-no-page", allEntries = true)
    })
    public CinemaResponse createCinema(CinemaRequest cinemaRequest) {
        if (cinemaRepository.findByName(cinemaRequest.getName()).isPresent()) {
            throw new AppException("Cinema with name '" + cinemaRequest.getName() + "' already exists",
                    ErrorCode.RESOURCE_CONFLICT);
        }

        Region region = regionRepository.findRegionBySlug(cinemaRequest.getSlugRegion()).orElseThrow(
                () -> new AppException("Region not found with slug: " + cinemaRequest.getSlugRegion(),
                        ErrorCode.MODEL_NOT_FOUND)
        );

        Cinema cinema = Cinema.builder()
                .name(cinemaRequest.getName())
                .address(cinemaRequest.getAddress())
                .region(region)
                .latitude(cinemaRequest.getLatitude())
                .longitude(cinemaRequest.getLongitude())
                .isActive(true)
                .build();

        Cinema savedCinema = cinemaRepository.save(cinema);
        return cinemaMapper.mapToResponse(savedCinema);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "cinema", key = "#cinemaId", unless = "#result == null")
    public Object getCinemaById(Long cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException("Cinema not found with id: " + cinemaId,
                        ErrorCode.CINEMA_NOT_FOUND));

        return cinemaMapper.mapToResponse(cinema);
    }

    @Caching(evict = {
            @CacheEvict(value = "cinema", key = "#cinemaId"),
            @CacheEvict(value = "cinemas-page", allEntries = true),
            @CacheEvict(value = "cinemas-no-page", allEntries = true)
    })
    public CinemaResponse updateCinema(Long cinemaId, CinemaRequest cinemaRequest) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException("Cinema not found with id: " + cinemaId,
                        ErrorCode.CINEMA_NOT_FOUND));

        // Check if another cinema with same name exists (excluding current cinema)
        cinemaRepository.findByName(cinemaRequest.getName())
                .ifPresent(existingCinema -> {
                    if (!existingCinema.getId().equals(cinemaId)) {
                        throw new AppException("Cinema with name '" + cinemaRequest.getName() + "' already exists",
                                ErrorCode.RESOURCE_CONFLICT);
                    }
                });

        cinema.setName(cinemaRequest.getName());
        cinema.setAddress(cinemaRequest.getAddress());
        cinema.setLatitude(cinemaRequest.getLatitude());
        cinema.setLongitude(cinemaRequest.getLongitude());
        Region region = regionRepository.findRegionBySlug(cinemaRequest.getSlugRegion()).orElseThrow(
                () -> new AppException("Region not found with slug: " + cinemaRequest.getSlugRegion(),
                        ErrorCode.MODEL_NOT_FOUND)
        );
        cinema.setRegion(region);

        Cinema updatedCinema = cinemaRepository.save(cinema);
        return cinemaMapper.mapToResponse(updatedCinema);
    }

    @Caching(evict = {
            @CacheEvict(value = "cinema", key = "#cinemaId"),
            @CacheEvict(value = "cinemas-page", allEntries = true),
            @CacheEvict(value = "cinemas-no-page", allEntries = true)
    })
    public void deleteCinema(Long cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException("Cinema not found with id: " + cinemaId,
                        ErrorCode.CINEMA_NOT_FOUND));

        // Soft delete by setting isActive to false
        cinema.setIsActive(false);
        cinemaRepository.save(cinema);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "cinema", key = "'name:' + #name", unless = "#result == null")
    public Object getCinemaByName(String name) {
        Cinema cinema = cinemaRepository.findByName(name)
                .orElseThrow(() -> new AppException("Cinema not found with name: " + name,
                        ErrorCode.CINEMA_NOT_FOUND));

        return cinemaMapper.mapToResponse(cinema);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "cinemas-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()", unless = "#result == null")
    public Object getAllCinemas(Pageable pageable) {
        Page<Cinema> cinemas = cinemaRepository.findByIsActiveTrue(pageable);
        return cinemas.map(cinemaMapper::mapToResponse);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "cinemas-search", key = "#keyword + '-' + #pageable.pageNumber + '-' + #pageable.pageSize", unless = "#result == null")
    public Object searchCinemas(String keyword, Pageable pageable) {
        Page<Cinema> cinemas = cinemaRepository.searchCinemas(keyword, pageable);
        return pageMapper.toPageResponse(cinemas, cinemaMapper::mapToResponse);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "cinemas-by-regionSlug", key = "#regionSlug + '-' + #pageable.pageNumber + '-' + #pageable.pageSize", unless = "#result == null")
    public Object getCinemasByRegion(String regionSlug, Pageable pageable) {
        Page<Cinema> cinemas = cinemaRepository.findCinemaByRegion_Slug(regionSlug, pageable);
        return pageMapper.toPageResponse(cinemas, cinemaMapper::mapToResponse);
    }

    @Cacheable(value = "cinemas-no-page", unless = "#result == null")
    public Object getAllCinemasNoPagination() {
        return cinemaRepository.findAll().stream()
                .map(cinemaMapper::mapToResponse)
                .toList();
    }
}
