package com.legendss.backend.repositories;

import com.legendss.backend.entities.User;
import com.legendss.backend.entities.Wheelchair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WheelchairRepository extends JpaRepository<Wheelchair, Long> {
    Optional<Wheelchair> findByOwner(User owner);
}
