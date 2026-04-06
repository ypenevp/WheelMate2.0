package com.legendss.backend.controllers;

import com.legendss.backend.entities.User;
import com.legendss.backend.entities.Wheelchair;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.services.WheelchairService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v2/wheelchair")
public class WheelchairController {

    private final WheelchairService wheelchairService;
    private final UserRepository userRepository;

    public WheelchairController(WheelchairService wheelchairService, UserRepository userRepository) {
        this.wheelchairService = wheelchairService;
        this.userRepository = userRepository;
    }

    @PostMapping("add")
    public Wheelchair addWheelchair(@RequestBody Wheelchair wheelchair, @RequestAttribute("email") String email) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        wheelchair.setOwner(owner);
        return wheelchairService.addWheelchair(wheelchair);
    }

    @PatchMapping("update/{id}")
    public Wheelchair updateWheelchair(@PathVariable Long id, @RequestBody Wheelchair wheelchair) {
        return wheelchairService.updateWheelchair(id, wheelchair);
    }

}
