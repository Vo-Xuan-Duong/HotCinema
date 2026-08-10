package com.example.cinema.mapper;

import com.example.cinema.dto.showtimeprice.ShowtimePriceCreateRequest;
import com.example.cinema.dto.showtimeprice.ShowtimePriceUpdateRequest;
import com.example.cinema.dto.showtimeprice.ShowtimePriceResponse;
import com.example.cinema.entity.ShowtimePrice;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShowtimePriceMapper {

    ShowtimePrice toEntity(ShowtimePriceCreateRequest request);

    ShowtimePriceResponse toResponse(ShowtimePrice entity);

    List<ShowtimePriceResponse> toResponseList(List<ShowtimePrice> entities);

    void updateEntityFromRequest(ShowtimePriceUpdateRequest request, @MappingTarget ShowtimePrice entity);
}
