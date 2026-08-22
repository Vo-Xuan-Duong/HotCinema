package com.example.cinema.repository;

import com.example.cinema.entity.MovieMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MovieMediaRepository extends JpaRepository<MovieMedia, UUID> {
}
