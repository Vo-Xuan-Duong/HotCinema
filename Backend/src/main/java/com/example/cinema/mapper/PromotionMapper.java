package com.example.cinema.mapper;

import com.example.cinema.dto.promotion.PromotionCreateRequest;
import com.example.cinema.dto.promotion.PromotionUpdateRequest;
import com.example.cinema.dto.promotion.PromotionResponse;
import com.example.cinema.entity.Promotion;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PromotionMapper {

    Promotion toEntity(PromotionCreateRequest request);

    PromotionResponse toResponse(Promotion entity);

    List<PromotionResponse> toResponseList(List<Promotion> entities);

    void updateEntityFromRequest(PromotionUpdateRequest request, @MappingTarget Promotion entity);
}
