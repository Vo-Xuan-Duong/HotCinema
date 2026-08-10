package com.example.cinema.mapper;

import com.example.cinema.dto.promotioncode.PromotionCodeCreateRequest;
import com.example.cinema.dto.promotioncode.PromotionCodeUpdateRequest;
import com.example.cinema.dto.promotioncode.PromotionCodeResponse;
import com.example.cinema.entity.PromotionCode;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PromotionCodeMapper {

    PromotionCode toEntity(PromotionCodeCreateRequest request);

    PromotionCodeResponse toResponse(PromotionCode entity);

    List<PromotionCodeResponse> toResponseList(List<PromotionCode> entities);

    void updateEntityFromRequest(PromotionCodeUpdateRequest request, @MappingTarget PromotionCode entity);
}
