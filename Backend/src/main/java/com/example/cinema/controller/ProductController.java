package com.example.cinema.controller;

import com.example.cinema.entity.Product;
import com.example.cinema.service.ProductService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.ProductMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.product.ProductCreateRequest;
import com.example.cinema.dto.product.ProductUpdateRequest;
import com.example.cinema.dto.product.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    public ProductController(ProductService productService, ProductMapper productMapper) {
        this.productService = productService;
        this.productMapper = productMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> pageResult = productService.findAll(pageable);
        Page<ProductResponse> responsePage = pageResult.map(productMapper::toResponse);
        PageResponse<ProductResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable UUID id) {
        ProductResponse res = productService.findById(id)
                .map(productMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductCreateRequest request) {
        Product entity = productMapper.toEntity(request);
        Product saved = productService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(productMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable UUID id, @Valid @RequestBody ProductUpdateRequest request) {
        Product existing = productService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id.toString()));
        productMapper.updateEntityFromRequest(request, existing);
        Product saved = productService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(productMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id.toString()));
        productService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}