package com.legendss.backend.repositories;

import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.entities.Panic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PanicRepository extends JpaRepository<Panic, Long> {
    List<Panic> findByWheelchairId(Long wheelchairId);
}
