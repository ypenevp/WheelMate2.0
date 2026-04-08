package com.legendss.backend.controllers;

import com.legendss.backend.dto.RelativeRequest;
import com.legendss.backend.dto.WheelchairRequest;
import com.legendss.backend.entities.ROLE;
import com.legendss.backend.entities.User;
import com.legendss.backend.entities.Wheelchair;
import com.legendss.backend.exception.ResourceNotFoundException;
import com.legendss.backend.repositories.UserRepository;
import com.legendss.backend.services.AuthService;
import com.legendss.backend.services.WheelchairService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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

    @PostMapping("/add")
    public ResponseEntity<Wheelchair> addWheelchair(@RequestAttribute("email") String email,
            @RequestBody WheelchairRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (wheelchairService.getWheelchairByOwner(user).isPresent()) {
            throw new IllegalArgumentException("User already has a wheelchair.");
        }

        Wheelchair wheelchair = new Wheelchair();
        wheelchair.setName(request.getName());
        wheelchair.setOwner(user);

        Wheelchair saved = wheelchairService.addWheelchair(wheelchair);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/my") // user can take his wheelchair
    public ResponseEntity<Wheelchair> getMyWheelchair(@RequestAttribute("email") String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Wheelchair wheelchair = wheelchairService.getWheelchairByOwner(user)
                .orElseThrow(() -> new ResourceNotFoundException("You do not have a wheelchair registered."));

        return ResponseEntity.ok(wheelchair);
    }

    @PutMapping("/update")
    public ResponseEntity<Wheelchair> editWheelchairName(@RequestAttribute("email") String email,
            @RequestBody WheelchairRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Wheelchair wheelchair = wheelchairService.getWheelchairByOwner(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wheelchair not found for this user."));

        wheelchair.setName(request.getName());
        Wheelchair updated = wheelchairService.addWheelchair(wheelchair);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteWheelchair(@RequestAttribute("email") String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (user.getWheelchair() == null) {
            throw new ResourceNotFoundException("Wheelchair not found.");
        }

        user.setWheelchair(null);
        userRepository.save(user);

        return ResponseEntity.ok("Wheelchair deleted successfully.");
    }

    @PostMapping("/add-relative")
    public ResponseEntity<String> addRelative(@RequestAttribute("email") String ownerEmail,
            @RequestBody RelativeRequest request) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found."));

        if (owner.getRole() != ROLE.USER) {
            throw new SecurityException("Only users with role USER can add relatives.");
        }

        User relative = userRepository.findByEmail(request.getRelativeEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Relative with this email not found."));

        if (relative.getRole() != ROLE.RELATIVE) {
            throw new IllegalArgumentException("The user you are trying to add is not registered as a RELATIVE.");
        }

        if (!owner.getRelatives().contains(relative)) {
            owner.getRelatives().add(relative);
            userRepository.save(owner);
        }

        return ResponseEntity.ok("Relative added successfully.");
    }

    @GetMapping("/relative/my-tracked")
    public ResponseEntity<List<Wheelchair>> getTrackedWheelchairs(@RequestAttribute("email") String email) {
        User relative = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (relative.getRole() != ROLE.RELATIVE) {
            throw new SecurityException("Only users with role RELATIVE can do this.");
        }

        // List<User> trackedUsers =
        // userRepository.findAllByRelativesContaining(relative);
        List<User> trackedUsers = userRepository.findAllUsersByRelativeId(relative.getId());

        List<Wheelchair> wheelchairs = new ArrayList<>();
        for (User u : trackedUsers) {
            if (u.getWheelchair() != null) {
                wheelchairs.add(u.getWheelchair());
            }
        }

        return ResponseEntity.ok(wheelchairs);
    }

    @PatchMapping("update/{id}")
    public Wheelchair updateWheelchair(@PathVariable Long id, @RequestBody Wheelchair wheelchair) {
        return wheelchairService.updateWheelchair(id, wheelchair);
    }

    @GetMapping("/getallrel")
    public ResponseEntity<Set<User>> getAllRelatives(@RequestAttribute("email") String email) {
        Set<User> relatives = this.wheelchairService.getAllRelatives(email);
        return ResponseEntity.ok(relatives);
    }

}
