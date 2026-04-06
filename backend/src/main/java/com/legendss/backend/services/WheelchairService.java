package com.legendss.backend.services;

import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.entities.Wheelchair;
import com.legendss.backend.repositories.FakePanicRepository;
import com.legendss.backend.repositories.WheelchairRepository;
import org.springframework.stereotype.Service;

@Service
public class WheelchairService {

    private final WheelchairRepository wheelchairRepository;
    private final FakePanicRepository fakePanicRepository;

    public WheelchairService(WheelchairRepository wheelchairRepository, FakePanicRepository fakePanicRepository) {
        this.wheelchairRepository = wheelchairRepository;
        this.fakePanicRepository = fakePanicRepository;
    }

    public Wheelchair addWheelchair(Wheelchair wheelchair) {
        return this.wheelchairRepository.save(wheelchair);
    }

    public Wheelchair getWheelchair(Long id) {
        return this.wheelchairRepository.findById(id).orElse(null);
    }

    public Wheelchair updateWheelchair(Long id, Wheelchair wheelchair) {
        Wheelchair wheelchairToUpdate = this.getWheelchair(id);

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
}
