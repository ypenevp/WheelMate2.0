package com.legendss.backend.controllers;

import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.entities.ROLE;
import com.legendss.backend.entities.User;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.services.FakePanicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v2/fakepanic")
public class FakePanicController {
    private final FakePanicService fakePanicService;
    private final UserRepository userRepository;



    public FakePanicController(FakePanicService fakePanicService,  UserRepository userRepository) {
        this.fakePanicService = fakePanicService;
        this.userRepository = userRepository;
    }

    @GetMapping("get/{id}")
    public ResponseEntity<FakePanic> getFakePanicController(@PathVariable Long id) {
        return ResponseEntity.ok(this.fakePanicService.getFakePanic(id));
    }

    @GetMapping("get/wheelchair/{wheelchairId}")
    public ResponseEntity<List<FakePanic>> getByWheelchairController(@PathVariable Long wheelchairId) {
        return ResponseEntity.ok(this.fakePanicService.getFakePanicsByWheelchairId(wheelchairId));
    }

    @GetMapping("/relative/my-tracked")// easier for frontend
    public ResponseEntity<List<FakePanic>> getTrackedFakePanics(@RequestAttribute("email") String email) {
        User relative = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (relative.getRole() != ROLE.RELATIVE) {
            throw new SecurityException("Only users with role RELATIVE can do this.");
        }

        List<User> trackedUsers = userRepository.findAllUsersByRelativeId(relative.getId());
        List<FakePanic> allFakePanics = new ArrayList<>();

        for (User u : trackedUsers) {
            if (u.getWheelchair() != null) {
                allFakePanics.addAll(fakePanicService.getFakePanicsByWheelchairId(u.getWheelchair().getId()));
            }
        }

        return ResponseEntity.ok(allFakePanics);
    }

}
