package com.legendss.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Table(name = "fake_panic")
@Entity
@Getter
@Setter
public class FakePanic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "location")
    private String location;

    @Column(name = "userInChair")
    private Boolean userInChair;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "wheelchair_id", nullable = false)
    private Wheelchair wheelchair;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }


}
