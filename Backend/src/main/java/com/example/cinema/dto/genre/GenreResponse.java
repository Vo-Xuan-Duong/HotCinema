package com.example.cinema.dto.genre;

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
public class GenreResponse {

    private UUID id;
    private String name;
    private String slug;
    private ZonedDateTime createdAt;
}
