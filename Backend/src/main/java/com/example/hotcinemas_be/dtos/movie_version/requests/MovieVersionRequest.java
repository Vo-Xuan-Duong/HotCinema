package com.example.hotcinemas_be.dtos.movie_version.request;

import com.example.hotcinemas_be.enums.AudioLanguage;
import com.example.hotcinemas_be.enums.ProjectionType;
import com.example.hotcinemas_be.enums.SubtitleLanguage;
import com.example.hotcinemas_be.models.Movie;
import jakarta.persistence.*;

public class MovieVersionRequest {
    private Long movieId;
    private ProjectionType projectionType;
    private AudioLanguage audioLanguage;
    private SubtitleLanguage subtitleLanguage;
}
