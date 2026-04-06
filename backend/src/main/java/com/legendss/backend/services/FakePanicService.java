package com.legendss.backend.services;

import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.repositories.FakePanicRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FakePanicService {
    private final FakePanicRepository fakePanicRepository;

    public FakePanicService(FakePanicRepository fakePanicRepository){
        this.fakePanicRepository = fakePanicRepository;
    }

    public FakePanic getFakePanic(Long id){
        return fakePanicRepository.findById(id).orElse(null);
    }

    public List<FakePanic> getAllFakePanics(){
        return fakePanicRepository.findAll();
    }

    public List<FakePanic> getFakePanicsByWheelchairId(Long wheelchairId) {
        return fakePanicRepository.findByWheelchairId(wheelchairId);
    }

    public FakePanic addFakePanic(FakePanic fakePanic){
        return fakePanicRepository.save(fakePanic);
    }

}
