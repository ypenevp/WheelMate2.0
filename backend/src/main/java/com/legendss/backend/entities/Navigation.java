package com.legendss.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Table(name = "navigation")
@Entity
@Data
public class Navigation {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "direction", nullable = false)
    @Enumerated(EnumType.STRING)
    private DIRECTION direction;

    @Column(name = "distance", nullable = false)
    private Double distance;
}
