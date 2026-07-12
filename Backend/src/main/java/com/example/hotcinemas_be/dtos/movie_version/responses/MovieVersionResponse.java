package com.example.hotcinemas_be.dtos.movie_version.response;

import com.example.hotcinemas_be.enums.AudioLanguage;
import com.example.hotcinemas_be.enums.ProjectionType;
import com.example.hotcinemas_be.enums.SubtitleLanguage;

public class MovieVersionResponse {
    private Long id;
    private String movieTitle;
    private String label;
    private ProjectionType projectionType;
    private AudioLanguage audioLanguage;
    private SubtitleLanguage subtitleLanguage;
}
