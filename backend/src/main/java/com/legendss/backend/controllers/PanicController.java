package com.legendss.backend.controllers;

import com.legendss.backend.entities.Panic;
import com.legendss.backend.services.PanicService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v2/panic")
public class PanicController {

    private final PanicService panicService;

    public PanicController(PanicService panicService) {
        this.panicService = panicService;
    }

    @GetMapping("get/{id}")
    public Panic getFakePanicController(@PathVariable Long id) {
        return this.panicService.getPanic(id);
    }

    @GetMapping ("get/all")
    public List<Panic> getAllFakePanicsController() {
        return this.panicService.getAllPanics();
    }

    @GetMapping("get/wheelchair/{wheelchairId}")
    public List<Panic> getByWheelchairController(@PathVariable Long wheelchairId) {
        return this.panicService.getPanicsByWheelchairId(wheelchairId);
    }

}
