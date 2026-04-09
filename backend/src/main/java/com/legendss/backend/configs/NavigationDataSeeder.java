package com.legendss.backend.configs;

import com.legendss.backend.entities.DIRECTION;
import com.legendss.backend.entities.Navigation;
import com.legendss.backend.repositories.NavigationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class NavigationDataSeeder implements CommandLineRunner {

    private final NavigationRepository navigationRepository;

    public NavigationDataSeeder(NavigationRepository navigationRepository) {
        this.navigationRepository = navigationRepository;
    }

    @Override
    public void run(String... args) {

        if (navigationRepository.count() > 0) {
            System.out.println("NavigationDataSeeder skipped: Navigation record already exists.");
            return;
        }

        Navigation defaultNavigation = new Navigation();
        defaultNavigation.setDirection(DIRECTION.STRAIGHT);
        defaultNavigation.setDistance(0.0);

        navigationRepository.save(defaultNavigation);

        System.out.println(" Default Navigation record created: position=STRAIGHT, distance=0.0");
    }
}
