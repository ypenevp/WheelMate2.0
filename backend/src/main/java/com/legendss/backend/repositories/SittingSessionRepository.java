package com.legendss.backend.repositories;

import com.legendss.backend.entities.SittingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SittingSessionRepository extends JpaRepository<SittingSession, Long> {
    
    List<SittingSession> findByWheelchairIdOrderByStartTimeDesc(Long wheelchairId);

    @Query("SELECT s FROM SittingSession s WHERE s.wheelchair.id = :wheelchairId AND s.endTime IS NULL")
    Optional<SittingSession> findOpenSession(Long wheelchairId);
}