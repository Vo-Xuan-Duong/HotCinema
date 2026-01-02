package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
}
