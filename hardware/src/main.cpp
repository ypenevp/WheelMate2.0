#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <MPU6050.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <TinyGPSPlus.h>
#include "Adafruit_VL53L0X.h"
#include "secrets.h"

WiFiClient espClient;
PubSubClient mqttClient(espClient);

unsigned long lastMsgTime = 0;
const unsigned long MSG_INTERVAL = 5000;

void setupWiFi() {
    delay(10);
    Serial.println();
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}

void reconnectMqtt() {
    while (!mqttClient.connected()) {
        Serial.print("Attempting MQTT connection...");
        if (mqttClient.connect(MQTT_CLIENT_ID)) {
            Serial.println("connected to MQTT broker!");
        } else {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void publishTelemetry() {
    String fakeLocation = "42.6973045, 23.32176172";
    bool fakeUserInChair = true;
    bool fakePanic = false;
    bool dummyFakePanic = false;

    JsonDocument doc;
    doc["location"] = fakeLocation;
    doc["userInChair"] = fakeUserInChair;
    doc["panic"] = fakePanic;
    doc["fakePanic"] = dummyFakePanic;

    String jsonString;
    serializeJson(doc, jsonString);

    String topic = String("wheelmate/telemetry/") + String(WHEELCHAIR_DB_ID);

    if(mqttClient.publish(topic.c_str(), jsonString.c_str())) {
        Serial.println("Published to " + topic + ": " + jsonString);
    } else {
        Serial.println("Failed to publish telemetry :(");
    }
}

void setup() {
    Serial.begin(115200);
    setupWiFi();
    mqttClient.setServer(MQTT_BROKER_IP, MQTT_PORT);
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        setupWiFi();
    }

    if (!mqttClient.connected()) {
        reconnectMqtt();
    }
    
    mqttClient.loop();

    unsigned long now = millis();
    if (now - lastMsgTime > MSG_INTERVAL) {
        lastMsgTime = now;
        publishTelemetry();
    }
}

