package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.Theater;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TheaterRepository extends JpaRepository<Theater, Long> {
    List<Theater> findTheaterByCinema_Id(Long cinemaId);

    Integer countTheaterByCinema_Id(Long cinemaId);
}
