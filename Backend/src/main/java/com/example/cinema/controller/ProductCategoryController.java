package com.example.cinema.controller;

import com.example.cinema.entity.ProductCategory;
import com.example.cinema.service.ProductCategoryService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.ProductCategoryMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.productcategory.ProductCategoryCreateRequest;
import com.example.cinema.dto.productcategory.ProductCategoryUpdateRequest;
import com.example.cinema.dto.productcategory.ProductCategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/productcategories")
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;
    private final ProductCategoryMapper productCategoryMapper;

    public ProductCategoryController(ProductCategoryService productCategoryService, ProductCategoryMapper productCategoryMapper) {
        this.productCategoryService = productCategoryService;
        this.productCategoryMapper = productCategoryMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductCategoryResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductCategory> pageResult = productCategoryService.findAll(pageable);
        Page<ProductCategoryResponse> responsePage = pageResult.map(productCategoryMapper::toResponse);
        PageResponse<ProductCategoryResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductCategoryResponse>> getById(@PathVariable UUID id) {
        ProductCategoryResponse res = productCategoryService.findById(id)
                .map(productCategoryMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductCategoryResponse>> create(@Valid @RequestBody ProductCategoryCreateRequest request) {
        ProductCategory entity = productCategoryMapper.toEntity(request);
        ProductCategory saved = productCategoryService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(productCategoryMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductCategoryResponse>> update(@PathVariable UUID id, @Valid @RequestBody ProductCategoryUpdateRequest request) {
        ProductCategory existing = productCategoryService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", id.toString()));
        productCategoryMapper.updateEntityFromRequest(request, existing);
        ProductCategory saved = productCategoryService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(productCategoryMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productCategoryService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductCategory", id.toString()));
        productCategoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}