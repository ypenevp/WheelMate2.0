package com.legendss.backend.repositories;

import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.entities.Mobility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

import java.util.List;

@Repository
public interface MobilityRepository extends JpaRepository<Mobility, Long> {
    @Query("SELECT m FROM Mobility m WHERE m.wheelchair.id = :wheelchairId AND m.starttime >= :fromDate AND m.finishtime <= :toDate ORDER BY m.starttime DESC")
    List<Mobility> findByWheelchairIdAndDateRange(@Param("wheelchairId") Long wheelchairId, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    List<Mobility> findByWheelchairId(Long wheelchairId);
}
