package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.promotion.requests.PromotionRequest;
import com.example.hotcinemas_be.services.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/vouchers")
@Tag(name = "Vouchers", description = "API for managing vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @Operation(summary = "Create a new voucher", description = "Allows an admin to create a new voucher.")
    @PostMapping
    public ResponseEntity<?> createVoucher(@RequestBody PromotionRequest promotionRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(201)
                .message("Voucher has been successfully created")
                .data(voucherService.createVoucher(promotionRequest))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(201).body(dataResponse);
    }

    @Operation(summary = "Get all vouchers", description = "Retrieves all vouchers.")
    @GetMapping
    public ResponseEntity<?> getAllVouchers(Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Vouchers retrieved successfully")
                .data(voucherService.getAllVouchers(pageable))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Get a voucher by ID", description = "Retrieves a voucher by its ID.")
    @GetMapping("/{id}")
    public ResponseEntity<?> getVoucherById(@PathVariable Long id) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Voucher retrieved successfully")
                .data(voucherService.getVoucherById(id))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Update a voucher", description = "Allows an admin to update an existing voucher.")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable Long id, @RequestBody PromotionRequest promotionRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Voucher has been successfully updated")
                .data(voucherService.updateVoucher(id, promotionRequest))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Delete a voucher", description = "Allows an admin to delete a voucher by its ID.")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Voucher has been successfully deleted")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Activate a voucher", description = "Allows an admin to activate a voucher by its ID.")
    @PostMapping("/{id}/activate")
    public ResponseEntity<?> activateVoucher(@PathVariable Long id) {
        voucherService.activateVoucher(id);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Voucher has been successfully activated")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Deactivate a voucher", description = "Allows an admin to deactivate a voucher by its ID.")
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateVoucher(@PathVariable Long id) {
        voucherService.deactivateVoucher(id);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Voucher has been successfully deactivated")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Get a voucher by code", description = "Retrieves a voucher by its code.")
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getVoucherByCode(@PathVariable String code) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Voucher retrieved successfully")
                .data(voucherService.getVoucherByCode(code))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Get all active vouchers", description = "Retrieves all active vouchers.")
    @GetMapping("/active")
    public ResponseEntity<?> getAllActiveVouchers(Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Active vouchers retrieved successfully")
                .data(voucherService.getActiveVouchers(pageable))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dataResponse);
    }
}
