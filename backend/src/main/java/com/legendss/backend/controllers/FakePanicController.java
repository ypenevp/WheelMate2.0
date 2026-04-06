package com.legendss.backend.controllers;

import com.legendss.backend.entities.FakePanic;
import com.legendss.backend.services.FakePanicService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v2/fakepanic")
public class FakePanicController {
    private final FakePanicService fakePanicService;

    public FakePanicController(FakePanicService fakePanicService) {
        this.fakePanicService = fakePanicService;
    }

    @GetMapping("get/{id}")
    public FakePanic getFakePanicController(@PathVariable Long id) {
        return this.fakePanicService.getFakePanic(id);
    }

    @GetMapping ("get/all")
    public List<FakePanic> getAllFakePanicsController() {
        return this.fakePanicService.getAllFakePanics();
    }

    @GetMapping("get/wheelchair/{wheelchairId}")
    public List<FakePanic> getByWheelchairController(@PathVariable Long wheelchairId) {
        return this.fakePanicService.getFakePanicsByWheelchairId(wheelchairId);
    }

    @PostMapping("add")
    public FakePanic addFakePanicController(@RequestBody FakePanic fakePanic) {
        return this.fakePanicService.addFakePanic(fakePanic);
    }

}
