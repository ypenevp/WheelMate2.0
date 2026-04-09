package com.legendss.backend.controllers;

import com.legendss.backend.entities.Navigation;
import com.legendss.backend.services.NavigationService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/v2/navigation")
public class NavigationController {
    private final NavigationService navigationService;

    public NavigationController(NavigationService navigationService) {
        this.navigationService = navigationService;
    }

    @GetMapping("/get/{id}")
    public Navigation getNavigationController(@PathVariable Long id) {
        return this.navigationService.getNavigation(id);
    }

    @PostMapping("/add")
    public Navigation addNavigationController(@RequestBody Navigation navigation) {
        return this.navigationService.addNavigation(navigation);
    }

    @PatchMapping("/update/{id}")
    public Navigation updateNavigationController(@PathVariable Long id, @RequestBody Navigation navigation) {
        return this.navigationService.updateNavigation(id, navigation);
    }
}
