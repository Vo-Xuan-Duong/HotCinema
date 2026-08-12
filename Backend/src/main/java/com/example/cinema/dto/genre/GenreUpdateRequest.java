package com.example.cinema.dto.genre;

import jakarta.validation.constraints.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenreUpdateRequest {

    @NotBlank

    private String name;
    @NotBlank
    private String slug;
}
