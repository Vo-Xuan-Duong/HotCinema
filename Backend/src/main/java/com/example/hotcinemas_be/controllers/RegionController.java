package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.region.request.RegionRequest;
import com.example.hotcinemas_be.repositorys.RegionRepository;
import com.example.hotcinemas_be.services.RegionService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.apache.http.protocol.ResponseDate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    @PostMapping
    public ResponseEntity<?> createRegion(@RequestBody RegionRequest regionRequest) {
        DataResponse<?> response = DataResponse.<Object>builder()
                .status(HttpStatus.CREATED.value())
                .message("Region created successfully")
                .data(regionService.createRegion(regionRequest))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{regionSlug}")
    public ResponseEntity<?> updateRegion(@PathVariable String regionSlug, @RequestBody RegionRequest regionRequest) {
        DataResponse<?> response = DataResponse.<Object>builder()
                .status(HttpStatus.OK.value())
                .message("Region updated successfully")
                .data(regionService.updateRegion(regionSlug, regionRequest))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{regionSlug}")
    public ResponseEntity<?> getRegionBySlug(@PathVariable String regionSlug) {
        DataResponse<?> response = DataResponse.<Object>builder()
                .status(HttpStatus.OK.value())
                .message("Region retrieved successfully")
                .data(regionService.getRegionBySlug(regionSlug))
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getAllRegions() {
        DataResponse<?> response = DataResponse.<Object>builder()
                .status(HttpStatus.OK.value())
                .message("Regions retrieved successfully")
                .data(regionService.getAllRegions())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{regionSlug}")
    public ResponseEntity<?> deleteRegion(@PathVariable String regionSlug) {
        regionService.deleteRegion(regionSlug);
        DataResponse<?> response = DataResponse.<Object>builder()
                .status(HttpStatus.OK.value())
                .message("Region deleted successfully")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }


}
