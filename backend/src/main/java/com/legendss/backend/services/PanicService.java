package com.legendss.backend.services;

import com.legendss.backend.entities.Panic;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.PanicRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PanicService {
    private final PanicRepository panicRepository;

    public PanicService(PanicRepository panicRepository){
        this.panicRepository = panicRepository;
    }

    public Panic getPanic(Long id){
        return this.panicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Panic not found with id: " + id));
    }

    public List<Panic> getAllPanics(){
        return this.panicRepository.findAll();
    }

    public List<Panic> getPanicsByWheelchairId(Long wheelchairId) {
        return this.panicRepository.findByWheelchairId(wheelchairId);
    }

    public Panic addPanic(Panic fakePanic){
        return panicRepository.save(fakePanic);
    }
}
