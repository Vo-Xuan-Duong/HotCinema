package com.example.hotcinemas_be.dtos.theater.requests;

import com.example.hotcinemas_be.enums.ScreenType;
import com.example.hotcinemas_be.enums.SoundSystem;
import com.example.hotcinemas_be.enums.TheaterType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TheaterRequest {
    private Long cinemaId;
    private String name;
    private TheaterType theaterType;
    private Integer numberOfRows;
    private Integer numberOfColumns;
    private ScreenType screenType;
    private SoundSystem soundSystem;
}

