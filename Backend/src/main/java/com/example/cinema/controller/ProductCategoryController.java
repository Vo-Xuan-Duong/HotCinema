package com.example.cinema.controller;

import com.example.cinema.service.ProductCategoryService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.productcategory.ProductCategoryCreateRequest;
import com.example.cinema.dto.productcategory.ProductCategoryUpdateRequest;
import com.example.cinema.dto.productcategory.ProductCategoryResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/productcategories")
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    public ProductCategoryController(ProductCategoryService productCategoryService) {
        this.productCategoryService = productCategoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductCategoryResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(productCategoryService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<ProductCategoryResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(productCategoryService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductCategoryResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(productCategoryService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductCategoryResponse>> create(@Valid @RequestBody ProductCategoryCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(productCategoryService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductCategoryResponse>> update(@PathVariable UUID id, @Valid @RequestBody ProductCategoryUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(productCategoryService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productCategoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
