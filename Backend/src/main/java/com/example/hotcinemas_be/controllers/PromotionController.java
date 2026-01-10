package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.promotion.requests.PromotionRequest;
import com.example.hotcinemas_be.services.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/promotions")
@Tag(name = "Promotions", description = "API for managing Promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @Operation(summary = "Create a new Promotion", description = "Allows an admin to create a new Promotion.")
    @PostMapping
    @PreAuthorize("hasAuthority('PROMOTION_CREATE')")
    public ResponseEntity<?> createPromotion(@RequestBody PromotionRequest promotionRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(201)
                .message("Promotion has been successfully created")
                .data(promotionService.createPromotion(promotionRequest))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(201).body(dataResponse);
    }

    @Operation(summary = "Get all Promotions", description = "Retrieves all Promotions.")
    @GetMapping
    @PreAuthorize("hasAuthority('PROMOTION_LIST')")
    public ResponseEntity<?> getAllPromotions(Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Promotions retrieved successfully")
                .data(promotionService.getAllPromotions(pageable))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Get a Promotion by ID", description = "Retrieves a Promotion by its ID.")
    @GetMapping("/{id}")
    public ResponseEntity<?> getPromotionById(@PathVariable Long id) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Promotion retrieved successfully")
                .data(promotionService.getPromotionById(id))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Update a Promotion", description = "Allows an admin to update an existing Promotion.")
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @RequestBody PromotionRequest promotionRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Promotion has been successfully updated")
                .data(promotionService.updatePromotion(id, promotionRequest))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Delete a Promotion", description = "Allows an admin to delete a Promotion by its ID.")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Promotion has been successfully deleted")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Activate a Promotion", description = "Allows an admin to activate a Promotion by its ID.")
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activatePromotion(@PathVariable Long id) {
        promotionService.activatePromotion(id);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Promotion has been successfully activated")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Deactivate a Promotion", description = "Allows an admin to deactivate a Promotion by its ID.")
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivatePromotion(@PathVariable Long id) {
        promotionService.deactivatePromotion(id);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Promotion has been successfully deactivated")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Get a Promotion by code", description = "Retrieves a Promotion by its code.")
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getPromotionByCode(@PathVariable String code) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Promotion retrieved successfully")
                .data(promotionService.getPromotionByCode(code))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Get all active Promotions", description = "Retrieves all active Promotions.")
    @GetMapping("/active")
    public ResponseEntity<?> getAllActivePromotions(Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Active Promotions retrieved successfully")
                .data(promotionService.getActivePromotions(pageable))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }
}
