package com.legendss.backend.services;

import com.legendss.backend.entities.Navigation;
import com.legendss.backend.repositories.NavigationRepository;
import org.springframework.stereotype.Service;

@Service
public class NavigationService {
    private final NavigationRepository navigationRepository;

    public NavigationService(NavigationRepository navigationRepository) {
        this.navigationRepository = navigationRepository;
    }

    public Navigation getNavigation(Long id) {
        return this.navigationRepository.findById(id).orElse(null);
    }

    public Navigation addNavigation(Navigation navigation){
        return this.navigationRepository.save(navigation);
    }

    public Navigation updateNavigation(Long id, Navigation navigation) {
        Navigation navigationToUpdate = this.getNavigation(id);

        if(navigationToUpdate == null) {
            return null;
        }

        if(navigation.getDirection() != null){
            navigationToUpdate.setDirection(navigation.getDirection());
        }

        if(navigation.getDistance() != null) {
            navigationToUpdate.setDistance(navigation.getDistance());
        }

        return this.navigationRepository.save(navigationToUpdate);
    }

}

