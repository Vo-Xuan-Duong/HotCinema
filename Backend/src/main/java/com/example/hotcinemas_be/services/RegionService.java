package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.region.request.RegionRequest;
import com.example.hotcinemas_be.dtos.region.response.RegionResponse;
import com.example.hotcinemas_be.mappers.RegionMapper;
import com.example.hotcinemas_be.models.Region;
import com.example.hotcinemas_be.repositorys.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;
    private final RegionMapper regionMapper;

    @Caching(evict = {
            @CacheEvict(value = "regionsCache", key = "#regionSlug"),
            @CacheEvict(value = "regionsCache", key = "'allRegions'")
    })
    public RegionResponse createRegion(RegionRequest regionRequest) {
        if(regionRepository.existsRegionByName(regionRequest.getName())) {
            throw new IllegalArgumentException("Region name already exists");
        }
        Region region = Region.builder()
                .name(regionRequest.getName())
                .slug(generateSlug(regionRequest.getName()))
                .isActive(true)
                .build();

        return regionMapper.mapToResponse(regionRepository.save(region));
    }

    public String generateSlug(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    @Caching(evict = {
            @CacheEvict(value = "regionsCache", key = "#regionSlug"),
            @CacheEvict(value = "regionsCache", key = "'allRegions'")
    })
    public RegionResponse updateRegion(String regionSlug ,RegionRequest regionRequest) {
        Region region = regionRepository.findRegionBySlug(regionSlug)
                .orElseThrow(() -> new IllegalArgumentException("Region not found"));

        region.setName(regionRequest.getName());
        region.setSlug(generateSlug(regionRequest.getName()));

        return regionMapper.mapToResponse(regionRepository.save(region));
    }

    @CacheEvict(value = "regionsCache", key = "#regionSlug")
    public void deleteRegion(String regionSlug) {
        Region region = regionRepository.findRegionBySlug(regionSlug)
                .orElseThrow(() -> new IllegalArgumentException("Region not found"));

        regionRepository.delete(region);
    }

    @Cacheable(value = "regionsCache", key = "#regionSlug")
    public Object getRegionBySlug(String regionSlug) {
        Region region = regionRepository.findRegionBySlug(regionSlug)
                .orElseThrow(() -> new IllegalArgumentException("Region not found"));

        return regionMapper.mapToResponse(region);
    }

    @Cacheable(value = "regionsCache", key = "'allRegions'")
    public Object getAllRegions() {
        List<Region> regions = regionRepository.findAll();
        return regions.stream()
                .map(regionMapper::mapToResponse)
                .toList();
    }

    public Page<RegionResponse> getAllRegionsPage(Pageable pageable) {
        Page<Region> regions = regionRepository.findAll(pageable);
        return regions.map(regionMapper::mapToResponse);
    }

}
