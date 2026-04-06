package com.legendss.backend.services;

import com.legendss.backend.entities.Wheelchair;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.repositories.WheelchairRepository;
import org.springframework.stereotype.Service;
import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.entities.User;
import com.legendss.backend.repositories.FakePanicRepository;

import java.util.Optional;

@Service
public class WheelchairService {

    private final WheelchairRepository wheelchairRepository;
    private final UserRepository userRepository;
    private final FakePanicRepository fakePanicRepository;

    public WheelchairService(WheelchairRepository wheelchairRepository, UserRepository userRepository,
            FakePanicRepository fakePanicRepository) {
        this.wheelchairRepository = wheelchairRepository;
        this.userRepository = userRepository;
        this.fakePanicRepository = fakePanicRepository;
    }

    public Wheelchair addWheelchair(Wheelchair wheelchair) {
        return this.wheelchairRepository.save(wheelchair);
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

     public Wheelchair updateWheelchair(Long id, Wheelchair wheelchair) {
        Wheelchair wheelchairToUpdate = this.getWheelchairById(id);

        if(wheelchair.getLocation() != null){
            wheelchairToUpdate.setLocation(wheelchair.getLocation());
        }

        if(wheelchair.getUserInChair() != null) {
            wheelchairToUpdate.setUserInChair(wheelchair.getUserInChair());
        }

        if(wheelchair.getPanic() != null) {
            wheelchairToUpdate.setPanic(wheelchair.getPanic());
        }

        if(wheelchair.getFakePanic() != null){
            if(wheelchair.getFakePanic() == true){
                FakePanic fakePanic = new FakePanic();
                fakePanic.setLocation(wheelchairToUpdate.getLocation());
                fakePanic.setUserInChair(wheelchairToUpdate.getUserInChair());
                fakePanic.setWheelchair(wheelchairToUpdate);
                fakePanicRepository.save(fakePanic);
            }
            wheelchairToUpdate.setFakePanic(wheelchair.getFakePanic());
        }

        return this.wheelchairRepository.save(wheelchairToUpdate);
    }

    public Wheelchair getWheelchairByUser(Long id) {
        return wheelchairRepository.findById(id).orElse(null);
    }

    
    public void deleteWheelchair(Long id) {
        this.wheelchairRepository.deleteById(id);
    }
}
