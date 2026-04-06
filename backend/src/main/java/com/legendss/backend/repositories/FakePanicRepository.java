package com.legendss.backend.repositories;

import com.legendss.backend.entities.FakePanic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FakePanicRepository extends JpaRepository<FakePanic, Long> {
    List<FakePanic> findByWheelchairId(Long wheelchairId);
}
