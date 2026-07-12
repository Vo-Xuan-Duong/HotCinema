package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TheaterRepository extends JpaRepository<Room, Long> {
    List<Room> findTheaterByCinema_Id(Long cinemaId);

    Integer countTheaterByCinema_Id(Long cinemaId);
}
