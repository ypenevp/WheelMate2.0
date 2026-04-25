package com.legendss.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.legendss.backend.entities.Wheelchair;
import jakarta.annotation.PostConstruct;
import org.eclipse.paho.client.mqttv3.IMqttMessageListener;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MqttSubscriberService {

    private final MqttClient mqttClient;
    private final WheelchairService wheelchairService;
    private final ObjectMapper objectMapper;

    @Value("${mqtt.topic}")
    private String telemetryTopic;

    public MqttSubscriberService(MqttClient mqttClient, WheelchairService wheelchairService) {
        this.mqttClient = mqttClient;
        this.wheelchairService = wheelchairService;
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        try {
            mqttClient.subscribe(telemetryTopic, new IMqttMessageListener() {
                @Override
                public void messageArrived(String topicReceived, MqttMessage message) throws Exception {
                    processIncomingMessage(topicReceived, new String(message.getPayload()));
                }
            });
            System.out.println("Subscribed to MQTT telemetry topic: " + telemetryTopic);

            String requestTopic = "wheelmate/request/numbers/+";
            mqttClient.subscribe(requestTopic, new IMqttMessageListener() {
                @Override
                public void messageArrived(String topicReceived, MqttMessage message) throws Exception {
                    processIncomingNumberRequest(topicReceived);
                }
            });
            System.out.println("Subscribed to MQTT request topic: " + requestTopic);

        } catch (Exception e) {
            System.err.println("Failed to subscribe to MQTT topics: " + e.getMessage());
        }
    }

    private void processIncomingMessage(String topicReceived, String payload) {
        try {
            String[] topicParts = topicReceived.split("/");
            Long wheelchairId = Long.parseLong(topicParts[topicParts.length - 1]);

            JsonNode data = objectMapper.readTree(payload);

            Wheelchair updatedData = new Wheelchair();
            if (data.has("location")) updatedData.setLocation(data.get("location").asText());
            if (data.has("userInChair")) updatedData.setUserInChair(data.get("userInChair").asBoolean());
            if (data.has("panic")) updatedData.setPanic(data.get("panic").asBoolean());
            if (data.has("fakePanic")) updatedData.setFakePanic(data.get("fakePanic").asBoolean());
            if (data.has("immobility")) updatedData.setImmobility(data.get("immobility").asBoolean());

            wheelchairService.updateWheelchair(wheelchairId, updatedData);
            System.out.println("Updated wheelchair ID [" + wheelchairId + "] with telemetry: " + payload);

        } catch (Exception e) {
            System.err.println("Error processing MQTT telemetry message: " + e.getMessage());
        }
    }

    private void processIncomingNumberRequest(String topicReceived) {
        try {
            String[] topicParts = topicReceived.split("/");
            Long wheelchairId = Long.parseLong(topicParts[topicParts.length - 1]);

            List<String> numbers = wheelchairService.getRelativeNumbersList(wheelchairId);

            ObjectNode responseNode = objectMapper.createObjectNode();
            responseNode.putPOJO("numbers", numbers);
            String jsonPayload = objectMapper.writeValueAsString(responseNode);

            String responseTopic = "wheelmate/config/numbers/" + wheelchairId;
            MqttMessage mqttMessage = new MqttMessage(jsonPayload.getBytes());
            mqttClient.publish(responseTopic, mqttMessage);

            System.out.println("Published numbers to: " + responseTopic);

        } catch (Exception e) {
            System.err.println("Error processing number request: " + e.getMessage());
        }
    }
}
