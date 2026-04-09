package com.legendss.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.legendss.backend.entities.Navigation;
import com.legendss.backend.repositories.NavigationRepository;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Service;

@Service
public class NavigationService {
    private final NavigationRepository navigationRepository;
    private final MqttClient mqttClient;
    private final ObjectMapper objectMapper;

    public NavigationService(NavigationRepository navigationRepository, MqttClient mqttClient) {
        this.navigationRepository = navigationRepository;
        this.mqttClient = mqttClient;
        this.objectMapper = new ObjectMapper();
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

        Navigation savedNavigation = this.navigationRepository.save(navigationToUpdate);

        try {
            String payload = objectMapper.writeValueAsString(savedNavigation);
            MqttMessage mqttMessage = new MqttMessage(payload.getBytes());
            mqttMessage.setQos(1);
            mqttClient.publish("wheelmate/navigation", mqttMessage);
        } catch (MqttException | JsonProcessingException e) {
            System.err.println("Failed to publish navigation to MQTT: " + e.getMessage());
        }

        return savedNavigation;
    }

}
