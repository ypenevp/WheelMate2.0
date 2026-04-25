package com.legendss.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "mobility")
@Getter
@Setter
public class Mobility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "mobility")
    private Boolean imobility;

    @Column(name = "starttime")
    private LocalDateTime starttime;

    @Column(name = "finishtime")
    private LocalDateTime finishtime;

    @ManyToOne
    @JoinColumn(name = "wheelchair_id", nullable = false)
    private Wheelchair wheelchair;

    @PrePersist
    protected void onCreate() {
        this.finishtime = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        this.starttime = this.finishtime.minusSeconds(10);
    }

}
