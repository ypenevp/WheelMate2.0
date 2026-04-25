package com.legendss.backend.repositories;

import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.entities.Mobility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MobilityRepository extends JpaRepository<Mobility, Long> {
    List<Mobility> findByWheelchairId(Long wheelchairId);
}
