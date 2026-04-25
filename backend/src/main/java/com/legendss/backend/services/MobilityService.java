package com.legendss.backend.services;

import com.legendss.backend.entities.Mobility;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.MobilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    public List<Mobility> getMobilitiesByWheelchairIdSorted(Long wheelchairId) {
        return this.mobilityRepository.findByWheelchairId(wheelchairId)
                .stream()
                .sorted((a, b) -> {
                    if (a.getStarttime() == null && b.getStarttime() == null) return 0;
                    if (a.getStarttime() == null) return 1;
                    if (b.getStarttime() == null) return -1;
                    return b.getStarttime().compareTo(a.getStarttime());
                })
                .collect(Collectors.toList());
    }

    public List<Mobility> getMobilitiesByWheelchairIdAndDateRange(Long wheelchairId, LocalDateTime from, LocalDateTime to) {
        return this.mobilityRepository.findByWheelchairIdAndDateRange(wheelchairId, from, to);
    }
}
