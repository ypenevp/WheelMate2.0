package com.legendss.backend.repositories;

import com.legendss.backend.entities.ROLE;
import com.legendss.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    long countByRole(ROLE role);

    @Query("SELECT u FROM User u JOIN u.relatives r WHERE r.id = :relativeId")
    List<User> findAllUsersByRelativeId(@Param("relativeId") Long relativeId);

    @Query("SELECT r FROM User u JOIN u.relatives r WHERE u.email = :email")
    Set<User> findRelativesByUserEmail(@Param("email") String email);
}