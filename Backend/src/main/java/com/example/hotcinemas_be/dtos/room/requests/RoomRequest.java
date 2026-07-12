package com.example.hotcinemas_be.dtos.theater.requests;

import com.example.hotcinemas_be.enums.AudioType;
import com.example.hotcinemas_be.enums.RoomType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomRequest {
    private Long cinemaId;
    private String name;
    private String description;
    private RoomType roomType;
    private AudioType audioType;
    private Integer numberOfRows;
    private Integer numberOfColumns;

}

