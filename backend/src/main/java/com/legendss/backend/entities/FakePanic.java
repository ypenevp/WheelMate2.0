package com.legendss.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Table(name = "fake_panic")
@Entity
@Data
public class FakePanic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "location")
    private String location;

    @Column(name = "userInChair")
    private Boolean userInChair;

    @ManyToOne
    @JoinColumn(name = "wheelchair_id", nullable = false)
    private Wheelchair wheelchair;

}
