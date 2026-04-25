package com.legendss.backend.controllers;

import com.legendss.backend.entities.Mobility;
import com.legendss.backend.entities.ROLE;
import com.legendss.backend.entities.User;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.services.MobilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v2/mobility")
public class MobilityController {

    private final MobilityService mobilityService;
    private final UserRepository userRepository;

    public MobilityController(MobilityService mobilityService, UserRepository userRepository) {
        this.mobilityService = mobilityService;
        this.userRepository = userRepository;
    }

    @GetMapping("/relative/my-tracked")
    public ResponseEntity<List<Mobility>> getTrackedMobilities(@RequestAttribute("email") String email) {
        User relative = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (relative.getRole() != ROLE.RELATIVE) {
            throw new SecurityException("Only users with role RELATIVE can do this.");
        }

        List<User> trackedUsers = userRepository.findAllUsersByRelativeId(relative.getId());
        List<Mobility> allMobilities = new ArrayList<>();

        for (User u : trackedUsers) {
            if (u.getWheelchair() != null) {
                allMobilities.addAll(mobilityService.getMobilitiesByWheelchairId(u.getWheelchair().getId()));
            }
        }

        return ResponseEntity.ok(allMobilities);
    }
}