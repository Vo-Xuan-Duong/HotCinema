package com.example.hotcinemas_be.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@Entity
@Table(name = "regions")
@NoArgsConstructor
@AllArgsConstructor
public class Region {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name = "slug", unique = true, nullable = false, length = 100)
    private String slug;

    @Column(name = "is_active")
    private Boolean isActive ;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
