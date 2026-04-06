package com.legendss.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column
    @Enumerated(EnumType.STRING)
    private ROLE role;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    private boolean enabled;

    @OneToOne(mappedBy = "owner")
    @JsonIgnore
    private Wheelchair wheelchair;

}
