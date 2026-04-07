package com.legendss.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "panic")
@Data
public class Panic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "location")
    private String location;

    @Column(name = "user_in_chair")
    private Boolean userInChair;

    @Column(name = "timestamp")
    private Long timestamp;

    @ManyToOne
    @JoinColumn(name = "wheelchair_id", nullable = false)
    private Wheelchair wheelchair;

    @PrePersist
    protected void onCreate() {
        this.timestamp = System.currentTimeMillis();
    }

}
