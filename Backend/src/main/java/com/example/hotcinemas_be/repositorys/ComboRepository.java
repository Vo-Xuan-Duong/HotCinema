package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComboRepository extends JpaRepository<BookingSeat, Long> {
}
