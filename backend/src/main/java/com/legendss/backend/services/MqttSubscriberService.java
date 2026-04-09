package com.legendss.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.legendss.backend.entities.Wheelchair;
import jakarta.annotation.PostConstruct;
import org.eclipse.paho.client.mqttv3.IMqttMessageListener;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MqttSubscriberService {

    private final MqttClient mqttClient;
    private final WheelchairService wheelchairService;
    private final ObjectMapper objectMapper;


    @Value("${mqtt.topic}")
    private String topic;

    public MqttSubscriberService(MqttClient mqttClient, WheelchairService wheelchairService) {
        this.mqttClient = mqttClient;
        this.wheelchairService = wheelchairService;
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        try {
            mqttClient.subscribe(topic, new IMqttMessageListener() {
                @Override
                public void messageArrived(String topicReceived, MqttMessage message) throws Exception {
                    processIncomingMessage(topicReceived, new String(message.getPayload()));
                }
            });
            System.out.println("Subscribed to MQTT topic: " + topic);
        } catch (Exception e) {
            System.err.println("Failed to subscribe to MQTT topic: " + e.getMessage());
        }
    }

    private void processIncomingMessage(String topicReceived, String payload) {
        try {
            String[] topicParts = topicReceived.split("/");
            Long wheelchairId = Long.parseLong(topicParts[topicParts.length - 1]); // get wheelchair id

            JsonNode data = objectMapper.readTree(payload);

            Wheelchair updatedData = new Wheelchair();
            if (data.has("location")) updatedData.setLocation(data.get("location").asText());
            if (data.has("userInChair")) updatedData.setUserInChair(data.get("userInChair").asBoolean());
            if (data.has("panic")) updatedData.setPanic(data.get("panic").asBoolean());
            if (data.has("fakePanic")) updatedData.setFakePanic(data.get("fakePanic").asBoolean());

            wheelchairService.updateWheelchair(wheelchairId, updatedData);
            System.out.println("Updated wheelchair ID [" + wheelchairId + "] with telemetry: " + payload);

        } catch (Exception e) {
            System.err.println("Error processing MQTT message: " + e.getMessage());
        }
    }
}
