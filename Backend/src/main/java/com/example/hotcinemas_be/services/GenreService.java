package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.genre.requests.GenreRequest;
import com.example.hotcinemas_be.dtos.genre.responses.GenreResponse;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.GenreMapper;
import com.example.hotcinemas_be.models.Genre;
import com.example.hotcinemas_be.models.MovieGenre;
import com.example.hotcinemas_be.repositorys.GenreRepository;
import com.example.hotcinemas_be.repositorys.MovieGenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final GenreMapper genreMapper;


    @CacheEvict(value = { "genre", "genres-list" }, allEntries = true)
    public GenreResponse createGenre(GenreRequest genreRequest) {
        Genre genre = Genre.builder()
                .id(genreRequest.getId())
                .name(genreRequest.getName())
                .build();
        return genreMapper.mapToResponse(genreRepository.save(genre));
    }

    @Caching(evict = {
            @CacheEvict(value = "genre", key = "#genreId"),
            @CacheEvict(value = "genres-list", allEntries = true)
    })
    public GenreResponse updateGenre(Long genreId, GenreRequest genreRequest) {
        Genre genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new AppException("Genre not found with id: " + genreId,
                        ErrorCode.MODEL_NOT_FOUND));
        genre.setId(genreRequest.getId());
        genre.setName(genreRequest.getName());
        return genreMapper.mapToResponse(genreRepository.save(genre));
    }

    @Caching(evict = {
            @CacheEvict(value = "genre", key = "#genreId"),
            @CacheEvict(value = "genres-list", allEntries = true)
    })
    public void deleteGenre(Long genreId) {
        Genre genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new AppException("Genre not found with id: " + genreId,
                        ErrorCode.MODEL_NOT_FOUND));
        genreRepository.delete(genre);
    }

    @Cacheable(value = "genre", key = "#genreId", unless = "#result == null")
    public Object getGenreById(Long genreId) {
        Genre genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new AppException("Genre not found with id: " + genreId,
                        ErrorCode.MODEL_NOT_FOUND));
        return genreMapper.mapToResponse(genre);
    }

    @Cacheable(value = "genre", key = "'name:' + #genreName", unless = "#result == null")
    public Object getGenreByName(String genreName) {
        Genre genre = genreRepository.findGenreByName(genreName)
                .orElseThrow(() -> new AppException("Genre not found with name: " + genreName,
                        ErrorCode.MODEL_NOT_FOUND));
        return genreMapper.mapToResponse(genre);
    }

    @Cacheable(value = "genres-list", unless = "#result == null")
    public Object getAllGenre() {
        List<Genre> genres = genreRepository.findAll();
        if (genres.isEmpty()) {
            throw new AppException("No genres found", ErrorCode.MODEL_NOT_FOUND);
        }
        return genres.stream().map(genreMapper::mapToResponse).collect(Collectors.toList());
    }

    public List<GenreResponse> getGenresByMovieId(Long movieId) {
        List<MovieGenre> movieGenres = movieGenreRepository.findMovieGenresByMovie_Id(movieId);

        return movieGenres.stream()
                .map(MovieGenre::getGenre)
                .map(genreMapper::mapToResponse)
                .collect(Collectors.toList());
    }
}
