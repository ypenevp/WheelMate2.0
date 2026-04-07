package com.legendss.backend.services;

import com.legendss.backend.entities.Panic;
import com.legendss.backend.entities.Wheelchair;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.PanicRepository;
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
    private final PanicRepository panicRepository;

    public WheelchairService(WheelchairRepository wheelchairRepository, UserRepository userRepository,
            FakePanicRepository fakePanicRepository, PanicRepository panicRepository) {
        this.wheelchairRepository = wheelchairRepository;
        this.userRepository = userRepository;
        this.fakePanicRepository = fakePanicRepository;
        this.panicRepository = panicRepository;
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
            boolean wasPanicBefore = wheelchairToUpdate.getPanic() != null && wheelchairToUpdate.getPanic(); // !!!
            boolean isPanicNow = wheelchair.getPanic();

            if(isPanicNow && !wasPanicBefore){
                Panic panic = new Panic();
                panic.setLocation(wheelchair.getLocation() != null ? wheelchair.getLocation() : wheelchairToUpdate.getLocation());
                panic.setUserInChair(wheelchair.getUserInChair() != null ? wheelchair.getUserInChair() : wheelchairToUpdate.getUserInChair());
                panic.setWheelchair(wheelchairToUpdate);
                this.panicRepository.save(panic);
            }
            wheelchairToUpdate.setPanic(isPanicNow);
        }

        if(wheelchair.getFakePanic() != null){
            boolean wasFakeBefore = wheelchairToUpdate.getFakePanic() != null && wheelchairToUpdate.getFakePanic(); // !!!
            boolean isFakeNow = wheelchair.getFakePanic();

            if(isFakeNow && !wasFakeBefore){
                FakePanic fakePanic = new FakePanic();
                fakePanic.setLocation(wheelchair.getLocation() != null ? wheelchair.getLocation() : wheelchairToUpdate.getLocation());
                fakePanic.setUserInChair(wheelchair.getUserInChair() != null ? wheelchair.getUserInChair() : wheelchairToUpdate.getUserInChair());
                fakePanic.setWheelchair(wheelchairToUpdate);
                this.fakePanicRepository.save(fakePanic);
            }
            wheelchairToUpdate.setFakePanic(isFakeNow);
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
