package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findUsersByRole_Name(String roleName, Pageable pageable);


    Page<User> findUsersByRole_NameNot(String roleName, Pageable pageable);


}
