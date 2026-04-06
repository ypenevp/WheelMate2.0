package com.legendss.backend.services;

import com.legendss.backend.entities.User;
import com.legendss.backend.entities.Wheelchair;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.repositories.WheelchairRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class WheelchairService {

    private final WheelchairRepository wheelchairRepository;
    private final UserRepository userRepository;

    public WheelchairService(WheelchairRepository wheelchairRepository, UserRepository userRepository) {
        this.wheelchairRepository = wheelchairRepository;
        this.userRepository = userRepository;
    }

    public Wheelchair addWheelchair(Wheelchair wheelchair) {
        return wheelchairRepository.save(wheelchair);
    }

    public Wheelchair getWheelchairById(Long id) {
        return wheelchairRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wheelchair not found"));
    }

    public Optional<Wheelchair> getWheelchairByOwner(User owner) {
        return wheelchairRepository.findByOwner(owner);
    }

    public Optional<Wheelchair> getWheelchairByOwnerId(Long ownerId) {
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return wheelchairRepository.findByOwner(user);
    }

    public void deleteWheelchair(Long id) {
        this.wheelchairRepository.deleteById(id);
    }
}
