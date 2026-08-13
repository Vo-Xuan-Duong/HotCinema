package com.example.cinema.repository;

import com.example.cinema.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Page<User> findAllByIsDeletedFalse(Pageable pageable);

    Optional<User> findByIdAndIsDeletedFalse(UUID id);

    @EntityGraph(attributePaths = "roles")
    Optional<User> findByEmailIgnoreCaseAndIsDeletedFalse(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);
}
