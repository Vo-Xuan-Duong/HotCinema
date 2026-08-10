package com.example.cinema.dto.moviemedia;

import java.time.ZonedDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieMediaResponse {

    private UUID id;
    private java.util.UUID movieId;
    private String type;
    private String url;
    private Integer sortOrder;
    private ZonedDateTime createdAt;
}
