package com.legendss.backend.services;

import com.legendss.backend.entities.Wheelchair;
import com.legendss.backend.repositories.WheelchairRepository;
import org.springframework.stereotype.Service;

@Service
public class WheelchairService {

    private final WheelchairRepository wheelchairRepository;

    public WheelchairService(WheelchairRepository wheelchairRepository) {
        this.wheelchairRepository = wheelchairRepository;
    }

    public Wheelchair addWheelchair(Wheelchair wheelchair) {
        return wheelchairRepository.save(wheelchair);
    }

    public Wheelchair getWheelchairByUser(Long id) {
        return wheelchairRepository.findById(id).orElse(null);
    }
}
