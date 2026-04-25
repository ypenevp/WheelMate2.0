package com.legendss.backend.services;

import com.legendss.backend.entities.Mobility;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.MobilityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MobilityService {
    final private MobilityRepository mobilityRepository;

    public MobilityService(MobilityRepository mobilityRepository) {
        this.mobilityRepository = mobilityRepository;
    }

    public Mobility getMobility(Long id){
        return this.mobilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mobility not found with id: " + id));
    }

    public List<Mobility> getAllMobilities(){
        return this.mobilityRepository.findAll();
    }

    public List<Mobility> getMobilitiesByWheelchairId(Long wheelchairId) {
        return this.mobilityRepository.findByWheelchairId((wheelchairId));
    }
}
