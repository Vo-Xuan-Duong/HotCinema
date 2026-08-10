package com.example.cinema.dto.moviemedia;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieMediaCreateRequest {

    private java.util.UUID movieId;
    private String type;
    private String url;
    private Integer sortOrder;
}
