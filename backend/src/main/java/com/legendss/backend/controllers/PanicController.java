package com.legendss.backend.controllers;

import com.legendss.backend.entities.Panic;
import com.legendss.backend.entities.ROLE;
import com.legendss.backend.entities.User;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.services.PanicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v2/panic")
public class PanicController {

    private final PanicService panicService;
    private final UserRepository userRepository;

    public PanicController(PanicService panicService,  UserRepository userRepository) {
        this.panicService = panicService;
        this.userRepository = userRepository;
    }

    @GetMapping("get/{id}")
    public ResponseEntity<Panic> getPanicController(@PathVariable Long id) {
        return ResponseEntity.ok(this.panicService.getPanic(id));
    }

    @GetMapping ("get/all")
    public ResponseEntity<List<Panic>> getAllPanicsController() {
        return ResponseEntity.ok(this.panicService.getAllPanics());
    }

    @GetMapping("get/wheelchair/{wheelchairId}")
    public ResponseEntity<List<Panic>> getByWheelchairController(@PathVariable Long wheelchairId) {
        return ResponseEntity.ok(this.panicService.getPanicsByWheelchairId(wheelchairId));
    }

    @GetMapping("/relative/my-tracked") // easier for frontend
    public ResponseEntity<List<Panic>> getTrackedPanics(@RequestAttribute("email") String email) {
        User relative = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (relative.getRole() != ROLE.RELATIVE) {
            throw new SecurityException("Only users with role RELATIVE can do this.");
        }
        List<User> trackedUsers = userRepository.findAllUsersByRelativeId(relative.getId());
        List<Panic> allPanics = new ArrayList<>();

        for (User u : trackedUsers) {
            if (u.getWheelchair() != null) {
                allPanics.addAll(panicService.getPanicsByWheelchairId(u.getWheelchair().getId()));
            }
        }

        return ResponseEntity.ok(allPanics);
    }
}