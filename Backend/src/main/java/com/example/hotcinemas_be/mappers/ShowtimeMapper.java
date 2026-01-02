package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.showtime.responses.*;
import com.example.hotcinemas_be.models.Cinema;
import com.example.hotcinemas_be.models.Showtime;
import com.example.hotcinemas_be.services.BookingSeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeMapper {

    private final BookingSeatService bookingSeatService;

    public ShowtimeResponse mapToResponse(com.example.hotcinemas_be.models.Showtime showtime) {
        if (showtime == null) {
            return null;
        }
        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .movieTitle(showtime.getMovie().getTitle())
                .cinemaName(showtime.getTheater().getCinema().getName())
                .roomName(showtime.getTheater().getName())
                .showDate(showtime.getShowDate())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .price(showtime.getBasePrice())
                .format(showtime.getFormat())
                .formatLabel(showtime.getFormat() != null ? showtime.getFormat().getValue() : null)
                .audioType(showtime.getAudioType())
                .audioTypeLabel(showtime.getAudioType() != null ? showtime.getAudioType().getValue() : null)
                .status(showtime.getStatus())
                .totalSeats(showtime.getTheater() != null ? showtime.getTheater().getTotalSeats() : 0)
                .seatsBooked(bookingSeatService.countBookedSeatsByShowtimeId(showtime.getId()))
                .build();
    }

    public ShowtimeInfo mapToShowtimeInfo(Showtime showtime){
        if(showtime == null){
            return null;
        }
        return ShowtimeInfo.builder()
                .showtimeId(showtime.getId())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .theaterId(showtime.getTheater().getId())
                .theaterName(showtime.getTheater().getName())
                .price(showtime.getBasePrice())
                .status(showtime.getStatus())
                .build();
    }

    public List<FormatWithShowtimes> mapFormats(List<Showtime> showtimes){
        return showtimes.stream()
                .collect(Collectors.groupingBy(Showtime::getFormat))
                .entrySet().stream()
                .map(entry -> {
                    String formatLabel = entry.getKey() != null ? entry.getKey().getValue() : "Unknown";
                    List<ShowtimeInfo> showtimeInfos = entry.getValue().stream()
                            .map(this::mapToShowtimeInfo)
                            .collect(Collectors.toList());
                    return FormatWithShowtimes.builder()
                            .formatType(formatLabel)
                            .showtimes(showtimeInfos)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<CinemaWithShowtimes> groupShowtimesByCinema(
            List<com.example.hotcinemas_be.models.Showtime> showtimes) {
        // Group by cinema
        return showtimes.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        s -> s.getTheater().getCinema(),
                        java.util.stream.Collectors.toList()
                ))
                .entrySet()
                .stream()
                .map(cinemaEntry -> {
                    Cinema cinema = cinemaEntry.getKey();
                    List<Showtime> listByCinemas = cinemaEntry.getValue();
                    return CinemaWithShowtimes.builder()
                            .cinemaId(cinema.getId())
                            .cinemaName(cinema.getName())
                            .address(cinema.getAddress())
                            .cityId(cinema.getRegion() != null ? cinema.getRegion().getId() : null)
                            .cityName(cinema.getRegion() != null ? cinema.getRegion().getName() : null)
                            .latitude(cinema.getLatitude())
                            .longitude(cinema.getLongitude())
                            .formats(mapFormats(listByCinemas))
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public List<MovieWithShowtimes> groupShowtimesByMovie(
            List<com.example.hotcinemas_be.models.Showtime> showtimes) {
        // Group by movie
        return showtimes.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        Showtime::getMovie,
                        java.util.stream.Collectors.toList()
                ))
                .entrySet()
                .stream()
                .map(movieEntry -> {
                    com.example.hotcinemas_be.models.Movie movie = movieEntry.getKey();
                    List<Showtime> listByMovies = movieEntry.getValue();
                    return MovieWithShowtimes.builder()
                            .movieId(movie.getId())
                            .movieTitle(movie.getTitle())
                            .posterUrl(movie.getPosterUrl())
                            .formats(mapFormats(listByMovies))
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
