// #include <Arduino.h>
// #include <Adafruit_NeoPixel.h>
// #include <Wire.h>
// #include <WiFi.h>
// #include <PubSubClient.h>
// #include <ArduinoJson.h>
// #include <MPU6050.h>
// #include <Adafruit_GFX.h>
// #include <Adafruit_SSD1306.h>
// #include <TinyGPSPlus.h>
// #include "Adafruit_VL53L0X.h"
// #include "secrets.h"

// #define SDA 8
// #define SCL 9
// #define BUZZER 2
// #define LED 37
// #define PANIC_START_BUTTON 35
// #define PANIC_STOP_BUTTON 36
// #define STOP_PANIC_TIMEOUT_MS 10000UL
// #define SSD1306_I2C_ADDRESS 0x3C

// #define SIM800_TX17
// #define SIM800_RX18
// #define SIM800_BAUD 9600
// #define SIM"0000"

// #define READY_TIMEOUT_MS 20000UL
// #define NETWORK_TIMEOUT_MS 20000UL
// #define SMS_ACK_TIMEOUT_MS 20000UL

// HardwareSerial sim800(1);

// const unsigned long SMS_INTERVAL_MS = 60000UL;

// const char *phoneNumbers[] =
//     {
//         "+359886175035",
//         "+359897406640",
// };

// const size_t phoneCount = sizeof(phoneNumbers) / sizeof(phoneNumbers[0]);

// WiFiClient espClient;
// PubSubClient mqttClient(espClient);

// unsigned long lastMsgTime = 0;
// unsigned long lastSosSent = 0;
// const unsigned long MSG_INTERVAL = 1000;
// bool simReady = false;

// bool isPanicPending = false;
// bool sendSOS = false;
// bool sendFakeSOS = false;
// unsigned long panicStartTime = 0;

// Adafruit_SSD1306 display(128, 64, &Wire, -1);  // 128x64 display on I2C

// unsigned long lastBlink = 0;
// const unsigned long BLINK_INTERVAL = 500;
// unsigned long lastBuzz = 0;

// Adafruit_VL53L0X lox = Adafruit_VL53L0X();
// #define SAVE_DISTANCE 200
// bool userInChairStatus = false;

// MPU6050 mpu;
// bool mpuReady = false;
// #define ACCEL_SCALE 16384.0f
// #define GYRO_SCALE 131.0f
// #define IMPACT_G_THRESHOLD 6.0f
// #define FREEFALL_G_THRESHOLD 0.05f
// #define FLIP_AZ_THRESHOLD -0.7f
// #define SEVERE_TILT_THRESHOLD 0.8f
// #define ROLL_RATE_THRESHOLD 400.0f
// #define FALL_CONFIRM_COUNT 4

// static int fallCounter = 0;
// float Ax = 0, Ay = 0, Az = 1;
// float Gx = 0, Gy = 0, Gz = 0;

// //////////////////////////
// //display
// void normalDisplay(){
//     display.clearDisplay();
//     display.setCursor(40, 25);
//     display.println("ZDR");
//     display.display();
// }

// void panicDisplay(){
//     display.clearDisplay();
//     display.setTextSize(2);
//     display.setCursor(20, 0);
//     display.println("ALERT");

//     display.setTextSize(1);
//     display.setCursor(0, 20);

//     for (size_t i = 0; i < phoneCount; i++) {
//         display.setCursor(0, 20 + (i * 10));
//         display.println(phoneNumbers[i]);
//     }

//     display.display();
// }

// //////////////////////////
// //panic buttons

// void readButtons() {

//     if (digitalRead(PANIC_START_BUTTON) == LOW) {
//         if (!isPanicPending && !sendSOS) {
//             isPanicPending = true;
//             sendFakeSOS = false;
//             panicStartTime = millis();
//             Serial.println("PANIC BUTTON PRESSED! 10 seconds to cancel...");
//         }
//         delay(200);
//     }

//     if (digitalRead(PANIC_STOP_BUTTON) == LOW) {
//         if (isPanicPending) {
//             isPanicPending = false;
//             sendFakeSOS = true;
//             Serial.println("CANCELED WITHIN 10s - FAKE PANIC LOGGED!");
//         } else if (sendSOS) {
//             sendSOS = false;
//             Serial.println("REAL PANIC STOPPED!");
//         }

//         digitalWrite(LED, LOW);
//         digitalWrite(BUZZER, LOW);
//         delay(200);
//     }
// }

// void panicIndication() {
//     if (isPanicPending || sendSOS) {
//         unsigned long now = millis();

//         unsigned long currentInterval = sendSOS ? 200 : 500;

//         if (now - lastBlink > currentInterval) {
//             lastBlink = now;
//             bool state = !digitalRead(LED);
//             digitalWrite(LED, state);
//             digitalWrite(BUZZER, state);
//         }
//     }
// }

// //////////////////////////

// void readMPU() {
//     if (!mpuReady) return;
//     int16_t ax, ay, az, gx, gy, gz;
//     mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
//     Ax = ax / ACCEL_SCALE;
//     Ay = ay / ACCEL_SCALE;
//     Az = az / ACCEL_SCALE;
//     Gx = gx / GYRO_SCALE;
//     Gy = gy / GYRO_SCALE;
//     Gz = gz / GYRO_SCALE;
// }

// String getFallReason() {
//     float totalG = sqrt(Ax * Ax + Ay * Ay + Az * Az);
//     if (totalG > IMPACT_G_THRESHOLD) return "HIGH IMPACT";
//     if (totalG < FREEFALL_G_THRESHOLD) return "FREEFALL";
//     if (Az < FLIP_AZ_THRESHOLD) return "FLIPPED";
//     if (fabs(Ax) > SEVERE_TILT_THRESHOLD) return "SEVERE TILT Ax";
//     if (fabs(Ay) > SEVERE_TILT_THRESHOLD) return "SEVERE TILT Ay";
//     return "";
// }

// bool checkFallDetection() {
//     if (!mpuReady) return false;
//     float totalG = sqrt(Ax * Ax + Ay * Ay + Az * Az);
//     bool instantFall = (totalG > IMPACT_G_THRESHOLD) ||
//                        (totalG < FREEFALL_G_THRESHOLD) ||
//                        (Az < FLIP_AZ_THRESHOLD) ||
//                        (fabs(Ax) > SEVERE_TILT_THRESHOLD) ||
//                        (fabs(Ay) > SEVERE_TILT_THRESHOLD);

//     if (instantFall) {
//         fallCounter++;
//     } else {
//         fallCounter = 0;
//     }
//     return (fallCounter >= FALL_CONFIRM_COUNT);
// }

// //////////////////////////

// void setupWiFi()
// {
//     delay(10);
//     Serial.println();
//     Serial.print("Connecting to WiFi: ");
//     Serial.println(WIFI_SSID);

//     WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

//     while (WiFi.status() != WL_CONNECTED)
//     {
//         delay(500);
//         Serial.print(".");
//     }

//     Serial.println("");
//     Serial.println("WiFi connected");
//     Serial.print("IP address: ");
//     Serial.println(WiFi.localIP());
// }

// void reconnectMqtt()
// {
//     while (!mqttClient.connected())
//     {
//         Serial.print("Attempting MQTT connection...");
//         if (mqttClient.connect(MQTT_CLIENT_ID))
//         {
//             Serial.println("connected to MQTT broker!");
//         }
//         else
//         {
//             Serial.print("failed, rc=");
//             Serial.print(mqttClient.state());
//             Serial.println(" try again in 5 seconds");
//             delay(5000);
//         }
//     }
// }

// void publishTelemetry()
// {
//      String fakeLocation = "42.6973045, 23.32176172";
//      bool currentUserInChair = userInChairStatus;

//      JsonDocument doc;
//      doc["location"] = fakeLocation;
//      doc["userInChair"] = currentUserInChair;
//      doc["panic"] = sendSOS;
//      doc["fakePanic"] = sendFakeSOS;

//     String jsonString;
//     serializeJson(doc, jsonString);

//     String topic = String("wheelmate/telemetry/") + String(WHEELCHAIR_DB_ID);

//     if (mqttClient.publish(topic.c_str(), jsonString.c_str()))
//     {
//         Serial.println("Published to " + topic + ": " + jsonString);
//         sendFakeSOS = false;
//     }
//     else
//     {
//         Serial.println("Failed to publish telemetry :(");
//     }
// }

// ///////////////

// bool sendAT(const char *cmd, const char *expected, unsigned long timeoutMs = 3000)
// {
//     while (sim800.available())
//     {
//         sim800.read();
//     }

//     Serial.print(">> ");
//     Serial.println(cmd);

//     sim800.println(cmd);

//     String response = "";
//     unsigned long start = millis();

//     while (millis() - start < timeoutMs)
//     {
//         while (sim800.available())
//         {
//             char c = sim800.read();
//             response += c;
//             Serial.write(c);
//         }

//         if (response.indexOf(expected) != -1)
//         {
//             Serial.println("\n[OK]");
//             return true;
//         }

//         if (response.indexOf("ERROR") != -1)
//         {
//             Serial.println("\n[ERROR]");
//             return false;
//         }
//     }

//     Serial.println("\n[TIMEOUT]");
//     return false;
// }

// void debugNetworkInfo()
// {
//     Serial.println("===== DEBUG INFO =====");

//     sendAT("AT+CSQ", "OK");
//     delay(500);

//     sendAT("AT+COPS?", "OK");
//     delay(500);

//     sendAT("AT+CREG?", "OK");
//     delay(500);

//     sendAT("AT+CGATT?", "OK");
//     delay(500);

//     sendAT("AT+GSN", "OK");
//     delay(500);

//     sendAT("AT+CBC", "OK");
//     delay(500);

//     Serial.println("======================");
// }

// int getSignalStrength()
// {
//     while (sim800.available())
//     {
//         sim800.read();
//     }

//     sim800.println("AT+CSQ");

//     String response = "";
//     unsigned long start = millis();

//     while (millis() - start < 2000)
//     {
//         while (sim800.available())
//         {
//             response += (char)sim800.read();
//         }
//     }

//     int index = response.indexOf("+CSQ:");
//     if (index == -1)
//         return -1;

//     int rssi = response.substring(index + 6).toInt();
//     return rssi;
// }

// bool waitForReady()
// {
//     Serial.println("Waiting for SIM800...");
//     unsigned long start = millis();

//     while (millis() - start < READY_TIMEOUT_MS)
//     {
//         if (sendAT("AT", "OK", 2000))
//         {
//             Serial.println("SIM800 is ready!");
//             return true;
//         }
//         Serial.println("Retrying...");
//         delay(1000);
//     }

//     Serial.println("ERROR: SIM800 not responding. Check wiring/power.");
//     return false;
// }

// bool checkSIMCard()
// {
//     Serial.println("Checking SIM card...");

//     while (sim800.available())
//     {
//         sim800.read();
//     }

//     sim800.println("AT+CPIN?");
//     String response = "";
//     unsigned long start = millis();

//     while (millis() - start < 5000)
//     {
//         while (sim800.available())
//         {
//             response += (char)sim800.read();
//         }

//         if (response.indexOf("READY") != -1)
//         {
//             Serial.println("SIM card present and unlocked.");
//             return true;
//         }

//         if (response.indexOf("SIM PIN") != -1)
//         {
//             Serial.println("SIM card present but locked. Unlocking...");
//             String cmd = String("AT+CPIN=\"") + SIM+ "\"";

//             if (sendAT(cmd.c_str(), "OK", 5000))
//             {
//                 Serial.println("PIN accepted!");
//                 delay(3000);
//                 return true;
//             }
//             else
//             {
//                 Serial.println("ERROR: Wrong PIN or PIN rejected.");
//                 return false;
//             }
//         }

//         if (response.indexOf("SIM PUK") != -1)
//         {
//             Serial.println("ERROR: SIM is PUK locked. Cannot proceed.");
//             return false;
//         }

//         if (response.indexOf("+CME ERROR: 10") != -1 || response.indexOf("not inserted") != -1)
//         {
//             Serial.println("ERROR: No SIM card inserted.");
//             return false;
//         }
//     }

//     Serial.println("ERROR: Could not determine SIM status. Response: " + response);
//     return false;
// }

// bool waitForNetwork()
// {
//     Serial.println("Waiting for network...");
//     unsigned long start = millis();

//     while (millis() - start < NETWORK_TIMEOUT_MS)
//     {
//         while (sim800.available())
//         {
//             sim800.read();
//         }

//         sim800.println("AT+CREG?");
//         String response = "";
//         unsigned long regStart = millis();

//         while (millis() - regStart < 2000)
//         {
//             while (sim800.available())
//             {
//                 response += (char)sim800.read();
//             }
//         }

//         if (response.indexOf(",1") != -1 || response.indexOf(",5") != -1)
//         {
//             Serial.println("Network registered!");
//             return true;
//         }

//         Serial.println("No network yet, retrying...");
//         delay(2000);
//     }

//     Serial.println("ERROR: Failed to register on network after timeout.");
//     return false;
// }

// bool initSIM800()
// {
//     Serial.println("Initializing SIM800...");

//     if (!waitForReady())
//         return false;
//     if (!checkSIMCard())
//         return false;
//     if (!waitForNetwork())
//         return false;

//     if (!sendAT("ATE0", "OK"))
//     {
//         Serial.println("WARNING: ATE0 failed (echo off not confirmed).");
//     }

//     if (!sendAT("AT+CMGF=1", "OK"))
//     {
//         Serial.println("ERROR: Failed to set SMS text mode.");
//         return false;
//     }

//     if (!sendAT("AT+CSCS=\"GSM\"", "OK"))
//     {
//         Serial.println("ERROR: Failed to set character set.");
//         return false;
//     }

//     Serial.println("SIM800 initialization complete!");
//     return true;
// }

// void sendSMS(const char *numbers[], size_t count, const char *message)
// {
//     for (size_t i = 0; i < count; i++)
//     {
//         Serial.print("Sending SMS to: ");
//         Serial.println(numbers[i]);

//         String cmd = String("AT+CMGS=\"") + numbers[i] + "\"";

//         if (!sendAT(cmd.c_str(), ">", 5000))
//         {
//             Serial.println("Error: No '>' prompt received.");
//             sim800.write(0x1B);
//             continue;
//         }

//         sim800.print(message);
//         delay(100);
//         sim800.write(0x1A);

//         String ack = "";
//         unsigned long start = millis();
//         bool success = false;

//         while (millis() - start < SMS_ACK_TIMEOUT_MS)
//         {
//             while (sim800.available())
//             {
//                 ack += (char)sim800.read();
//             }

//             if (ack.indexOf("+CMGS") != -1)
//             {
//                 success = true;
//                 break;
//             }
//             if (ack.indexOf("ERROR") != -1)
//             {
//                 break;
//             }
//         }

//         if (success)
//         {
//             Serial.println("SMS sent successfully!");
//         }
//         else
//         {
//             Serial.println("Failed to send SMS. Response: " + ack);
//         }

//         delay(500);
//     }
// }

// ///////////////

// void setup()
// {
//     Serial.begin(115200);
//     Serial.println("System starting...");

//     Wire.begin(SDA, SCL);
//     delay(100);

//     setupWiFi();
//     mqttClient.setServer(MQTT_BROKER_IP, MQTT_PORT);

//     sim800.begin(SIM800_BAUD, SERIAL_8N1, SIM800_RX, SIM800_TX);
//     delay(3000);

//     if (!display.begin(SSD1306_I2C_ADDRESS, 0x3C)) {
//         Serial.println("Failed to initialize display!");
//     } else {
//         display.setTextSize(2);
//         display.setTextColor(SSD1306_WHITE);
//         display.cp437(true);
//     }

//     simReady = initSIM800();

//     if (simReady)
//     {
//         debugNetworkInfo();

//         int rssi = getSignalStrength();
//         Serial.print("Signal Strength (RSSI): ");
//         Serial.println(rssi);
//     }

//     if (!simReady)
//     {
//         Serial.println("FATAL: SIM800 init failed. SMS will not be sent.");
//     }

//     pinMode(PANIC_START_BUTTON, INPUT_PULLUP);
//     pinMode(PANIC_STOP_BUTTON, INPUT_PULLUP);
//     pinMode(LED, OUTPUT);
//     pinMode(BUZZER, OUTPUT);
//     digitalWrite(LED, LOW);
//     digitalWrite(BUZZER, LOW);

//         Serial.println("Initializing VL53L0X...");
//         if (!lox.begin(0x29, false, &Wire)) {
//             Serial.println("WARNING: Failed to boot VL53L0X. Is it connected?");
//         } else {
//             Serial.println("VL53L0X ready!");
//             lox.startRangeContinuous();
//         }

//         Serial.println("Initializing MPU6050...");
//         mpu.initialize();
//         uint8_t mpuId = mpu.getDeviceID();
//         if (mpuId == 0x34 || mpuId == 0x38) {
//             Serial.printf("MPU6050 OK (id=0x%02X)\n", mpuId);
//             mpu.setSleepEnabled(false);
//             mpuReady = true;
//         } else {
//             Serial.printf("WARNING: MPU6050 FAILED (id=0x%02X)\n", mpuId);
//             mpuReady = false;
//         }

// }

// void loop()
// {
//     if (WiFi.status() != WL_CONNECTED) {
//         setupWiFi();
//     }

//     if (!mqttClient.connected()) {
//         reconnectMqtt();
//     }

//     mqttClient.loop();

//     readButtons();
//     panicIndication();

//         if (lox.isRangeComplete()) {
//             int dist = lox.readRange();
//             if (dist > 0 && dist < 8190) {
//                 userInChairStatus = (dist <= SAVE_DISTANCE);
//             }
//         }

//        static unsigned long lastMpuRead = 0;
//         if (millis() - lastMpuRead > 100) {
//             lastMpuRead = millis();
//             readMPU();
//             if (checkFallDetection()) {
//                 if (!isPanicPending && !sendSOS) {
//                     isPanicPending = true;
//                     sendFakeSOS = false;
//                     panicStartTime = millis();
//                     Serial.println("!!! FALL/FLIP DETECTED: " + getFallReason() + " !!!");
//                     Serial.println("10 seconds to cancel...");
//                 }
//             }
//         }

//     if (isPanicPending && (millis() - panicStartTime >= STOP_PANIC_TIMEOUT_MS)) {
//         isPanicPending = false;
//         sendSOS = true;
//         lastSosSent = 0;
//         Serial.println("10 SECONDS PASSED - REAL PANIC ACTIVATED!");
//     }

//     unsigned long now = millis();

//     if (now - lastMsgTime > MSG_INTERVAL) {
//         lastMsgTime = now;
//         publishTelemetry();
//     }

//     if (sendSOS || isPanicPending) {
//         panicDisplay();
//     } else {
//         normalDisplay();
//     }

//     if (sendSOS && (now - lastSosSent > SMS_INTERVAL_MS)) {
//         lastSosSent = now;
//         sendSMS(phoneNumbers, phoneCount, "SOS ALERT!");
//     }
// }

// ///////////////////////////////////////////////////////////////////////////////////

// #include <Arduino.h>
// #include <Wire.h>
// #include <WiFi.h>
// #include <PubSubClient.h>
// #include <ArduinoJson.h>
// #include <MPU6050.h>
// #include <Adafruit_GFX.h>
// #include <Adafruit_SSD1306.h>
// #include "Adafruit_VL53L0X.h"
// #include "secrets.h"

// #define SDA 8
// #define SCL 9
// #define BUZZER 2
// #define LED 37
// #define PANIC_START_BUTTON 35
// #define PANIC_STOP_BUTTON 36
// #define SIM800_RX 18
// #define SIM800_TX 17
// #define GPS_RX 16
// #define GPS_TX 19

// #define SCREEN_WIDTH 128
// #define SCREEN_HEIGHT 64

// #define ACCEL_SCALE 16384.0
// #define GYRO_SCALE 131.0

// #define DEBOUNCE_MS 50
// #define SENSOR_INTERVAL_MS 100
// #define BUTTON_INTERVAL_MS 80
// #define DEBUG_INTERVAL_MS 1000

// double vl53l0x_raw;

// float Ax;
// float Ay;
// float Az;
// float Gx;
// float Gy;
// float Gz;

// MPU6050 mpu;
// Adafruit_VL53L0X lox = Adafruit_VL53L0X();
// Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
// WiFiClient espClient;
// PubSubClient mqttClient(espClient);

// unsigned long lastMsgTime = 0;
// unsigned long lastMqttReconnectAttempt = 0;
// const unsigned long MSG_INTERVAL = 5000;
// const unsigned long MQTT_RECONNECT_INTERVAL = 5000;

// double lat;
// double lng;
// bool userInChair;
// bool panic = false;
// bool fakePanic = false;

// bool debugS = true;
// bool debugi2c = true;
// bool loxReady = false;
// bool mpuReady = false;
// bool mqttReady = false;

// unsigned long lastSensorRead = 0;
// unsigned long lastButtonRead = 0;
// unsigned long lastDebugPrint = 0;

// bool lastPanicStartRaw = HIGH;
// bool lastPanicStopRaw = HIGH;
// unsigned long panicStartBounceAt = 0;
// unsigned long panicStopBounceAt = 0;
// unsigned long panicStartedAt = 0;
// unsigned long panicLastToggle = 0;
// bool panicOutputState = false;

// #define PANIC_DURATION_MS 10000
// #define PANIC_BLINK_MS 250

// #define FALL_FREEFALL_G 0.55f
// #define FALL_IMPACT_G 1.90f
// #define FALL_GYRO_DPS 180.0f
// #define FALL_TILT_DEG 60.0f
// #define FALL_SEVERE_TILT 75.0f
// #define FALL_CONFIRM_MS 450
// #define FALL_CLEAR_MS 1200

// ////////////////////////////////////////////////////
// //mqtt

// void setupWiFi()
// {
//     delay(10);
//     Serial.println();
//     Serial.print("Connecting to WiFi: ");
//     Serial.println(WIFI_SSID);

//     WiFi.mode(WIFI_STA);
//     WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

//     unsigned long startAttempt = millis();
//     while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 15000)
//     {
//         delay(500);
//         Serial.print(".");
//     }

//     if (WiFi.status() == WL_CONNECTED)
//     {
//         Serial.println();
//         Serial.println("WiFi connected");
//         Serial.print("IP address: ");
//         Serial.println(WiFi.localIP());
//     }
//     else
//     {
//         Serial.println();
//         Serial.println("WiFi connect failed");
//     }
// }

// bool reconnectMqtt()
// {
//     if (mqttClient.connected())
//         return true;

//     if (millis() - lastMqttReconnectAttempt < MQTT_RECONNECT_INTERVAL)
//         return false;

//     lastMqttReconnectAttempt = millis();

//     Serial.print("Attempting MQTT connection...");

//     String clientId = String(MQTT_CLIENT_ID) + "-" + String((uint32_t)ESP.getEfuseMac(), HEX);

//     if (mqttClient.connect(clientId.c_str()))
//     {
//         Serial.println("connected to MQTT broker!");
//         mqttReady = true;
//         return true;
//     }

//     Serial.print("failed, rc=");
//     Serial.println(mqttClient.state());
//     mqttReady = false;
//     return false;
// }

// void publishTelemetry()
// {
//     if (WiFi.status() != WL_CONNECTED)
//         return;

//     if (!mqttClient.connected())
//         return;

//     StaticJsonDocument<512> doc;

//     doc["location"] = String(lat, 6) + "," + String(lng, 6);
//     doc["userInChair"] = userInChair;
//     doc["panic"] = panic;
//     doc["fakePanic"] = fakePanic;

//     String jsonString;
//     serializeJson(doc, jsonString);

//     String topic = String("wheelmate/telemetry/") + String(WHEELCHAIR_DB_ID);

//     if (mqttClient.publish(topic.c_str(), jsonString.c_str()))
//     {
//         Serial.println("Published to " + topic + ": " + jsonString);
//     }
//     else
//     {
//         Serial.println("Failed to publish telemetry");
//     }
// }

// ////////////////////////////////////////////////////
// //read sensors

// void readMPU()
// {
//     int16_t ax, ay, az, gx, gy, gz;
//     mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

//     Ax = ax / ACCEL_SCALE;
//     Ay = ay / ACCEL_SCALE;
//     Az = az / ACCEL_SCALE;
//     Gx = gx / GYRO_SCALE;
//     Gy = gy / GYRO_SCALE;
//     Gz = gz / GYRO_SCALE;
// }

// void readVL53L0X()
// {
//     if (!loxReady)
//         return;

//     if (lox.isRangeComplete())
//     {
//         vl53l0x_raw = lox.readRange();
//         if (vl53l0x_raw > 8190)
//             Serial.println("Out of range");
//     }
// }

// void readButtons()
// {
//     bool rawStart = (digitalRead(PANIC_START_BUTTON) == LOW);
//     bool rawStop = (digitalRead(PANIC_STOP_BUTTON) == LOW);

//     if (rawStart != lastPanicStartRaw)
//     {
//         panicStartBounceAt = millis();
//         lastPanicStartRaw = rawStart;
//     }

//     if (rawStop != lastPanicStopRaw)
//     {
//         panicStopBounceAt = millis();
//         lastPanicStopRaw = rawStop;
//     }

//     bool startConfirmed = rawStart && (millis() - panicStartBounceAt > DEBOUNCE_MS);
//     if (startConfirmed && !panic)
//     {
//         panic = true;
//         panicStartedAt = millis();
//         panicLastToggle = millis();
//         panicOutputState = false;

//         Serial.println("[BUTTON] Panic START -> panic = true");
//     }

//     bool stopConfirmed = rawStop && (millis() - panicStopBounceAt > DEBOUNCE_MS);
//     if (stopConfirmed && panic)
//     {
//         panic = false;
//         Serial.println("[BUTTON] Panic STOP -> panic = false");
//     }
// }

// ////////////////////////////////////////////////////
// //panic

// void panicIndication()
// {
//     if (!panic)
//     {
//         digitalWrite(LED, LOW);
//         digitalWrite(BUZZER, LOW);
//         return;
//     }

//     if (millis() - panicStartedAt >= PANIC_DURATION_MS) // full panic
//     {
//         panic = false;
//         digitalWrite(LED, LOW);
//         digitalWrite(BUZZER, LOW);

//         Serial.println("[PANIC] TIMEOUT");
//         return;
//     }

//     if (millis() - panicLastToggle >= PANIC_BLINK_MS)
//     {
//         panicLastToggle = millis();
//         panicOutputState = !panicOutputState;

//         digitalWrite(LED, panicOutputState);
//         digitalWrite(BUZZER, panicOutputState);
//     }
// }

// void fallDetection()
// {
//     if (!mpuReady || panic)
//         return;

//     float aMag = sqrtf(Ax * Ax + Ay * Ay + Az * Az);
//     float gMag = sqrtf(Gx * Gx + Gy * Gy + Gz * Gz);

//     float nz = 0.0f;
//     if (aMag > 0.01f)
//     {
//         nz = Az / aMag;
//         if (nz > 1.0f)
//             nz = 1.0f;
//         if (nz < -1.0f)
//             nz = -1.0f;
//     }

//     float tiltDeg = acosf(nz) * 57.29578f;

//     bool freeFall = aMag < FALL_FREEFALL_G;
//     bool impact = aMag > FALL_IMPACT_G;
//     bool tilted = tiltDeg > FALL_TILT_DEG;
//     bool severeTilt = tiltDeg > FALL_SEVERE_TILT;
//     bool fastRotation = gMag > FALL_GYRO_DPS;

//     static bool candidate = false;
//     static bool sawFreeFall = false;
//     static unsigned long candidateAt = 0;

//     unsigned long now = millis();

//     if (!candidate)
//     {
//         if (freeFall || (tilted && fastRotation) || (impact && tilted) || severeTilt)
//         {
//             candidate = true;
//             sawFreeFall = freeFall;
//             candidateAt = now;

//             Serial.printf("[FALL] candidate a=%.2f g=%.1f tilt=%.1f ff=%d imp=%d rot=%d\n",
//                           aMag, gMag, tiltDeg, freeFall, impact, fastRotation);
//         }
//         return;
//     }

//     if (freeFall)
//         sawFreeFall = true;

//     bool confirmed =
//         (sawFreeFall && impact) ||
//         (tilted && fastRotation && (now - candidateAt >= FALL_CONFIRM_MS)) ||
//         (severeTilt && fastRotation) ||
//         (impact && tiltDeg > FALL_TILT_DEG);

//     if (confirmed)
//     {
//         panic = true;
//         fakePanic = false;

//         candidate = false;
//         sawFreeFall = false;

//         panicStartedAt = now;
//         panicLastToggle = now;
//         panicOutputState = false;

//         Serial.println("[FALL] CONFIRMED -> panic = true");
//         return;
//     }

//     if (now - candidateAt > FALL_CLEAR_MS && !(freeFall || impact || tilted || fastRotation))
//     {
//         candidate = false;
//         sawFreeFall = false;
//         Serial.println("[FALL] candidate cleared");
//     }
// }

// ////////////////////////////////////////////////////
// //display

// void showNormal()
// {
//     display.clearDisplay();

//     display.setTextSize(2);
//     display.setTextColor(SSD1306_WHITE);
//     display.setCursor(0, 0);
//     display.println("NORMAL");

//     display.setTextSize(1);
//     display.setCursor(0, 20);
//     display.printf("Ax: %.2f\n", Ax);
//     display.printf("Ay: %.2f\n", Ay);
//     display.printf("Az: %.2f\n", Az);

//     display.drawLine(0, 54, 128, 54, SSD1306_WHITE);

//     display.setCursor(0, 56);

//     display.printf("MPU:%s ", mpuReady ? "OK" : "ERR");
//     display.printf("TOF:%s ", loxReady ? "OK" : "ERR");
//     display.printf("USR:%s", userInChair ? "1" : "0");

//     display.display();
// }

// void showPanic()
// {
//     display.clearDisplay();

//     display.setTextSize(2);
//     display.setTextColor(SSD1306_WHITE);
//     display.setCursor(10, 0);
//     display.println("ALERT!");

//     display.setTextSize(1);
//     display.setCursor(20, 25);
//     display.println("EMERGENCY");

//     display.setCursor(10, 40);

//     if (fakePanic)
//         display.println("VERIFY...");
//     else
//         display.println("FALL DETECTED");

//     display.drawLine(0, 54, 128, 54, SSD1306_WHITE);
//     display.setCursor(0, 56);
//     display.println("Press STOP");

//     display.display();
// }

// ////////////////////////////////////////////////////
// //debug

// void debugSensors()
// {
//     if (debugS == true)
//     {
//         Serial.println("==================");
//         Serial.printf("Panic: %s\n", panic ? "TRUE" : "FALSE");
//         Serial.printf("FakePanic: %s\n", fakePanic ? "TRUE" : "FALSE");
//         Serial.printf("Vl53l0x: %.0f\n", vl53l0x_raw);

//         Serial.printf("Accel  X: %+6.3f g\n", Ax);
//         Serial.printf("Accel  Y: %+6.3f g\n", Ay);
//         Serial.printf("Accel  Z: %+6.3f g\n", Az);

//         Serial.printf("Gyro   X: %+8.2f deg/s\n", Gx);
//         Serial.printf("Gyro   Y: %+8.2f deg/s\n", Gy);
//         Serial.printf("Gyro   Z: %+8.2f deg/s\n", Gz);
//         Serial.println("==================");
//     }
// }

// void debugI2Cscan()
// {
//     if (debugi2c == true)
//     {
//         Serial.println("I2C Scanner...");

//         for (byte address = 1; address < 127; address++)
//         {
//             Wire.beginTransmission(address);
//             byte error = Wire.endTransmission();

//             if (error == 0)
//                 Serial.printf("Device found at: 0x%02X\n", address);
//         }

//         Serial.println("Scan complete.");
//     }
// }

// ////////////////////////////////////////////////////
// //main

// void setup()
// {
//     Serial.begin(115200);
//     delay(1000);

//     pinMode(PANIC_START_BUTTON, INPUT_PULLUP);
//     pinMode(PANIC_STOP_BUTTON, INPUT_PULLUP);
//     pinMode(LED, OUTPUT);
//     pinMode(BUZZER, OUTPUT);
//     digitalWrite(LED, LOW);
//     digitalWrite(BUZZER, LOW);

//     Wire.begin(SDA, SCL);
//     delay(1000);

//     debugI2Cscan();

//     mpu.initialize();

//     uint8_t id = mpu.getDeviceID();
//     if (id == 0x34 || id == 0x38)
//     {
//         Serial.printf("MPU6050 connected! (id=0x%02X)\n", id);
//         mpuReady = true;
//     }
//     else
//         Serial.printf("MPU6050 connection failed! (id=0x%02X)\n", id);

//     if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
//     {
//         Serial.println("SSD1306 failed");
//     }
//     display.clearDisplay();
//     display.display();

//     setupWiFi();
//     mqttClient.setServer(MQTT_BROKER_IP, MQTT_PORT);
//     mqttClient.setBufferSize(512);
//     reconnectMqtt();
//     publishTelemetry();
// }

// void loop()
// {
//     unsigned long now = millis();

//     if (WiFi.status() != WL_CONNECTED)
//     {
//         setupWiFi();
//     }

//     if (!mqttClient.connected())
//     {
//         reconnectMqtt();
//     }

//     mqttClient.loop();

//     if (now - lastSensorRead >= SENSOR_INTERVAL_MS)
//     {
//         lastSensorRead = now;
//         readMPU();
//         fallDetection();
//         readVL53L0X();
//     }

//     if (now - lastButtonRead >= BUTTON_INTERVAL_MS)
//     {
//         lastButtonRead = now;
//         readButtons();
//     }

//     panicIndication();
//     publishTelemetry();

//     if (panic)
//         showPanic();
//     else
//         showNormal();

//     if (now - lastDebugPrint >= DEBUG_INTERVAL_MS)
//     {
//         lastDebugPrint = now;
//         debugSensors();
//     }
// }
//////////
//////////
//////////

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <MPU6050.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "Adafruit_VL53L0X.h"
#include "secrets.h"

#define SDA 8
#define SCL 9
#define BUZZER 2
#define LED 37
#define PANIC_START_BUTTON 35
#define PANIC_STOP_BUTTON 36
#define SIM800_RX 18
#define SIM800_TX 17
#define GPS_RX 16
#define GPS_TX 19

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define ACCEL_SCALE 16384.0
#define GYRO_SCALE 131.0

#define DEBOUNCE_MS 50
#define SENSOR_INTERVAL_MS 100
#define BUTTON_INTERVAL_MS 80
#define DEBUG_INTERVAL_MS 1000

double vl53l0x_raw;

float Ax;
float Ay;
float Az;
float Gx;
float Gy;
float Gz;

MPU6050 mpu;
Adafruit_VL53L0X lox = Adafruit_VL53L0X();
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

unsigned long lastMsgTime = 0;
unsigned long lastMqttReconnectAttempt = 0;
const unsigned long MSG_INTERVAL = 500;
const unsigned long MQTT_RECONNECT_INTERVAL = 5000;

double lat;
double lng;
bool userInChair;
bool panic = false;
bool fakePanic = false;
bool panicPending = false;

bool debugS = true;
bool debugi2c = true;
bool loxReady = false;
bool mpuReady = false;
bool mqttReady = false;

unsigned long lastSensorRead = 0;
unsigned long lastButtonRead = 0;
unsigned long lastDebugPrint = 0;

bool lastPanicStartRaw = HIGH;
bool lastPanicStopRaw = HIGH;
unsigned long panicStartBounceAt = 0;
unsigned long panicStopBounceAt = 0;
unsigned long panicStartedAt = 0;
unsigned long panicLastToggle = 0;
bool panicOutputState = false;

#define PANIC_DURATION_MS 10000
#define PANIC_BLINK_MS 250

#define FALL_FREEFALL_G 0.55f
#define FALL_IMPACT_G 1.90f
#define FALL_GYRO_DPS 180.0f
#define FALL_TILT_DEG 60.0f
#define FALL_SEVERE_TILT 75.0f
#define FALL_CONFIRM_MS 450
#define FALL_CLEAR_MS 1200

//////////////////////////////////////////
//mqtt

void setupWiFi()
{
    delay(10);
    Serial.println();
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 15000)
    {
        delay(500);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println();
        Serial.println("WiFi connected");
        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
    }
    else
    {
        Serial.println();
        Serial.println("WiFi connect failed");
    }
}

bool reconnectMqtt()
{
    if (mqttClient.connected())
        return true;

    if (millis() - lastMqttReconnectAttempt < MQTT_RECONNECT_INTERVAL)
        return false;

    lastMqttReconnectAttempt = millis();

    Serial.print("Attempting MQTT connection...");

    String clientId = String(MQTT_CLIENT_ID) + "-" + String((uint32_t)ESP.getEfuseMac(), HEX);

    if (mqttClient.connect(clientId.c_str()))
    {
        Serial.println("connected to MQTT broker!");
        mqttReady = true;
        return true;
    }

    Serial.print("failed, rc=");
    Serial.println(mqttClient.state());
    mqttReady = false;
    return false;
}

void publishTelemetry()
{
    if (WiFi.status() != WL_CONNECTED)
        return;

    if (!mqttClient.connected())
        return;

    unsigned long now = millis();
    if (now - lastMsgTime < MSG_INTERVAL)
        return;

    lastMsgTime = now;

    StaticJsonDocument<512> doc;

    doc["location"] = String(lat, 6) + "," + String(lng, 6);
    doc["userInChair"] = userInChair;
    doc["panic"] = panic;
    doc["fakePanic"] = panicPending;

    String jsonString;
    serializeJson(doc, jsonString);

    String topic = String("wheelmate/telemetry/") + String(WHEELCHAIR_DB_ID);

    if (mqttClient.publish(topic.c_str(), jsonString.c_str()))
    {
        Serial.println("Published to " + topic + ": " + jsonString);
    }
    else
    {
        Serial.println("Failed to publish telemetry");
    }
}

void publishEvent(bool isPanic)
{
    if (WiFi.status() != WL_CONNECTED)
        return;

    if (!mqttClient.connected())
        return;

    StaticJsonDocument<256> doc;

    doc["location"] = String(lat, 6) + "," + String(lng, 6);
    doc["userInChair"] = userInChair;
    doc["panic"] = isPanic;
    doc["fakePanic"] = !isPanic;

    String jsonString;
    serializeJson(doc, jsonString);

    String topic = String("wheelmate/events/") + String(WHEELCHAIR_DB_ID);

    if (mqttClient.publish(topic.c_str(), jsonString.c_str()))
    {
        Serial.println("Event published to " + topic + ": " + jsonString);
    }
    else
    {
        Serial.println("Failed to publish event");
    }
}

//////////////////////////////////////////
//read sensors

void readMPU()
{
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

    Ax = ax / ACCEL_SCALE;
    Ay = ay / ACCEL_SCALE;
    Az = az / ACCEL_SCALE;
    Gx = gx / GYRO_SCALE;
    Gy = gy / GYRO_SCALE;
    Gz = gz / GYRO_SCALE;
}

void readVL53L0X()
{
    if (!loxReady)
        return;

    if (lox.isRangeComplete())
    {
        vl53l0x_raw = lox.readRange();
        if (vl53l0x_raw > 8190)
            Serial.println("Out of range");
    }
}

void readButtons()
{
    bool rawStart = (digitalRead(PANIC_START_BUTTON) == LOW);
    bool rawStop = (digitalRead(PANIC_STOP_BUTTON) == LOW);

    if (rawStart != lastPanicStartRaw)
    {
        panicStartBounceAt = millis();
        lastPanicStartRaw = rawStart;
    }

    if (rawStop != lastPanicStopRaw)
    {
        panicStopBounceAt = millis();
        lastPanicStopRaw = rawStop;
    }

    bool startConfirmed = rawStart && (millis() - panicStartBounceAt > DEBOUNCE_MS);
    if (startConfirmed && !panic && !panicPending)
    {
        panicPending = true;
        panicStartedAt = millis();
        panicLastToggle = millis();
        panicOutputState = false;

        Serial.println("[BUTTON] Panic START -> panicPending = true");
    }

    bool stopConfirmed = rawStop && (millis() - panicStopBounceAt > DEBOUNCE_MS);

    if (stopConfirmed && panicPending)
    {
        panicPending = false;
        digitalWrite(LED, LOW);
        digitalWrite(BUZZER, LOW);

        Serial.println("[BUTTON] Panic STOP during pending -> fakePanic event");
        publishEvent(false);
    }

    if (stopConfirmed && panic)
    {
        panic = false;
        digitalWrite(LED, LOW);
        digitalWrite(BUZZER, LOW);

        Serial.println("[BUTTON] Panic STOP -> panic = false");
    }
}

//////////////////////////////////////////
//panic

void panicIndication()
{
    if (!panic && !panicPending)
    {
        digitalWrite(LED, LOW);
        digitalWrite(BUZZER, LOW);
        return;
    }

    if (panicPending && (millis() - panicStartedAt >= PANIC_DURATION_MS))
    {
        panicPending = false;
        panic = true;
        panicStartedAt = millis();

        Serial.println("[PANIC] TIMEOUT -> panic confirmed, publishing event");
        publishEvent(true);
    }

    if (millis() - panicLastToggle >= PANIC_BLINK_MS)
    {
        panicLastToggle = millis();
        panicOutputState = !panicOutputState;

        digitalWrite(LED, panicOutputState);
        digitalWrite(BUZZER, panicOutputState);
    }
}

void fallDetection()
{
    if (!mpuReady || panic || panicPending)
        return;

    float aMag = sqrtf(Ax * Ax + Ay * Ay + Az * Az);
    float gMag = sqrtf(Gx * Gx + Gy * Gy + Gz * Gz);

    float nz = 0.0f;
    if (aMag > 0.01f)
    {
        nz = Az / aMag;
        if (nz > 1.0f)
            nz = 1.0f;
        if (nz < -1.0f)
            nz = -1.0f;
    }

    float tiltDeg = acosf(nz) * 57.29578f;

    bool freeFall = aMag < FALL_FREEFALL_G;
    bool impact = aMag > FALL_IMPACT_G;
    bool tilted = tiltDeg > FALL_TILT_DEG;
    bool severeTilt = tiltDeg > FALL_SEVERE_TILT;
    bool fastRotation = gMag > FALL_GYRO_DPS;

    static bool candidate = false;
    static bool sawFreeFall = false;
    static unsigned long candidateAt = 0;

    unsigned long now = millis();

    if (!candidate)
    {
        if (freeFall || (tilted && fastRotation) || (impact && tilted) || severeTilt)
        {
            candidate = true;
            sawFreeFall = freeFall;
            candidateAt = now;

            Serial.printf("[FALL] candidate a=%.2f g=%.1f tilt=%.1f ff=%d imp=%d rot=%d\n",
                          aMag, gMag, tiltDeg, freeFall, impact, fastRotation);
        }
        return;
    }

    if (freeFall)
        sawFreeFall = true;

    bool confirmed =
        (sawFreeFall && impact) ||
        (tilted && fastRotation && (now - candidateAt >= FALL_CONFIRM_MS)) ||
        (severeTilt && fastRotation) ||
        (impact && tiltDeg > FALL_TILT_DEG);

    if (confirmed)
    {
        panic = true;
        candidate = false;
        sawFreeFall = false;

        panicStartedAt = now;
        panicLastToggle = now;
        panicOutputState = false;

        Serial.println("[FALL] CONFIRMED -> panic = true, publishing event");
        publishEvent(true);
        return;
    }

    if (now - candidateAt > FALL_CLEAR_MS && !(freeFall || impact || tilted || fastRotation))
    {
        candidate = false;
        sawFreeFall = false;
        Serial.println("[FALL] candidate cleared");
    }
}

//////////////////////////////////////////
//display

void showNormal()
{
    display.clearDisplay();

    display.setTextSize(2);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("NORMAL");

    display.setTextSize(1);
    display.setCursor(0, 20);
    display.printf("Ax: %.2f\n", Ax);
    display.printf("Ay: %.2f\n", Ay);
    display.printf("Az: %.2f\n", Az);

    display.drawLine(0, 54, 128, 54, SSD1306_WHITE);

    display.setCursor(0, 56);
    display.printf("MPU:%s ", mpuReady ? "OK" : "ERR");
    display.printf("TOF:%s ", loxReady ? "OK" : "ERR");
    display.printf("USR:%s", userInChair ? "1" : "0");

    display.display();
}

void showPanic()
{
    display.clearDisplay();

    display.setTextSize(2);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(10, 0);
    display.println("ALERT!");

    display.setTextSize(1);
    display.setCursor(20, 25);
    display.println("EMERGENCY");

    display.setCursor(10, 40);

    if (panicPending)
        display.println("VERIFY...");
    else
        display.println("FALL DETECTED");

    display.drawLine(0, 54, 128, 54, SSD1306_WHITE);
    display.setCursor(0, 56);
    display.println("Press STOP");

    display.display();
}

//////////////////////////////////////////
//debug

void debugSensors()
{
    if (debugS == true)
    {
        Serial.println("==================");
        Serial.printf("Panic: %s\n", panic ? "TRUE" : "FALSE");
        Serial.printf("PanicPending: %s\n", panicPending ? "TRUE" : "FALSE");
        Serial.printf("Vl53l0x: %.0f\n", vl53l0x_raw);

        Serial.printf("Accel  X: %+6.3f g\n", Ax);
        Serial.printf("Accel  Y: %+6.3f g\n", Ay);
        Serial.printf("Accel  Z: %+6.3f g\n", Az);

        Serial.printf("Gyro   X: %+8.2f deg/s\n", Gx);
        Serial.printf("Gyro   Y: %+8.2f deg/s\n", Gy);
        Serial.printf("Gyro   Z: %+8.2f deg/s\n", Gz);
        Serial.println("==================");
    }
}

void debugI2Cscan()
{
    if (debugi2c == true)
    {
        Serial.println("I2C Scanner...");

        for (byte address = 1; address < 127; address++)
        {
            Wire.beginTransmission(address);
            byte error = Wire.endTransmission();

            if (error == 0)
                Serial.printf("Device found at: 0x%02X\n", address);
        }

        Serial.println("Scan complete.");
    }
}

void setup()
{
    Serial.begin(115200);
    delay(1000);

    pinMode(PANIC_START_BUTTON, INPUT_PULLUP);
    pinMode(PANIC_STOP_BUTTON, INPUT_PULLUP);
    pinMode(LED, OUTPUT);
    pinMode(BUZZER, OUTPUT);
    digitalWrite(LED, LOW);
    digitalWrite(BUZZER, LOW);

    Wire.begin(SDA, SCL);
    delay(1000);

    debugI2Cscan();

    mpu.initialize();

    uint8_t id = mpu.getDeviceID();
    if (id == 0x34 || id == 0x38)
    {
        Serial.printf("MPU6050 connected! (id=0x%02X)\n", id);
        mpuReady = true;
    }
    else
        Serial.printf("MPU6050 connection failed! (id=0x%02X)\n", id);

    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
    {
        Serial.println("SSD1306 failed");
    }
    display.clearDisplay();
    display.display();

    setupWiFi();
    mqttClient.setServer(MQTT_BROKER_IP, MQTT_PORT);
    mqttClient.setBufferSize(512);
    reconnectMqtt();
    publishTelemetry();
}

void loop()
{
    unsigned long now = millis();

    if (WiFi.status() != WL_CONNECTED)
    {
        setupWiFi();
    }

    if (!mqttClient.connected())
    {
        reconnectMqtt();
    }

    mqttClient.loop();

    if (now - lastSensorRead >= SENSOR_INTERVAL_MS)
    {
        lastSensorRead = now;
        readMPU();
        fallDetection();
        readVL53L0X();
    }

    if (now - lastButtonRead >= BUTTON_INTERVAL_MS)
    {
        lastButtonRead = now;
        readButtons();
    }

    panicIndication();
    publishTelemetry();

    if (panic || panicPending)
        showPanic();
    else
        showNormal();

    if (now - lastDebugPrint >= DEBUG_INTERVAL_MS)
    {
        lastDebugPrint = now;
        debugSensors();
    }
}