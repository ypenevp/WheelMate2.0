package com.legendss.backend.entities;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "wheelchairs")
@Getter
@Setter
public class Wheelchair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "location")
    private String location;

    @Column(name = "userInChair")
    private boolean userInChair;

    @Column(name = "panic")
    private boolean panic;

    @Column(name = "fakepanic")
    private boolean fakePanic;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User owner;

    @PrePersist
    public void prePersist() {
        userInChair = false;
        panic = false;
        fakePanic = false;
    }

}