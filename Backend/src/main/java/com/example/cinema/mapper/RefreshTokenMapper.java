package com.example.cinema.mapper;

import com.example.cinema.dto.refreshtoken.RefreshTokenCreateRequest;
import com.example.cinema.dto.refreshtoken.RefreshTokenUpdateRequest;
import com.example.cinema.dto.refreshtoken.RefreshTokenResponse;
import com.example.cinema.entity.RefreshToken;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RefreshTokenMapper {

    RefreshToken toEntity(RefreshTokenCreateRequest request);

    RefreshTokenResponse toResponse(RefreshToken entity);

    List<RefreshTokenResponse> toResponseList(List<RefreshToken> entities);

    void updateEntityFromRequest(RefreshTokenUpdateRequest request, @MappingTarget RefreshToken entity);
}
