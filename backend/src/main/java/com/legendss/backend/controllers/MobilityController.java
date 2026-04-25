package com.legendss.backend.controllers;

import com.legendss.backend.entities.Mobility;
import com.legendss.backend.services.MobilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v2/mobility")
public class MobilityController {

    private final MobilityService mobilityService;

    public MobilityController(MobilityService mobilityService) {
        this.mobilityService = mobilityService;
    }

    @GetMapping("get/{id}")
    public ResponseEntity<Mobility> getMobilityController(@PathVariable Long id) {
        return ResponseEntity.ok(this.mobilityService.getMobility(id));
    }

    @GetMapping ("get/all")
    public ResponseEntity<List<Mobility>> getAllMobilitiesController() {
        return ResponseEntity.ok(this.mobilityService.getAllMobilities());
    }

    @GetMapping("get/wheelchair/{wheelchairId}")
    public ResponseEntity<List<Mobility>> getByWheelchairController(@PathVariable Long wheelchairId) {
        return ResponseEntity.ok(this.mobilityService.getMobilitiesByWheelchairId(wheelchairId));
    }
}