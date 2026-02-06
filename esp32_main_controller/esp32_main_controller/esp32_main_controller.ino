#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

// ============================
// WIFI CREDENTIALS
// ============================
const char* ssid = "SANJAY";
const char* password = "12345678";

// ============================
// BACKEND APIs
// ============================
const char* wasteDetectedURL = "http://10.172.167.52:5000/waste_detected";
const char* getWasteURL      = "http://10.172.167.52:5000/get_waste_type";

// ============================
// PIN DEFINITIONS
// ============================
#define TRIG_PIN 5
#define ECHO_PIN 4        // ⚠ voltage divider required
#define SERVO_PIN 18

// ============================
// OBJECTS
// ============================
Servo binServo;

// ============================
// FLAGS & TIMERS
// ============================
bool busy = false;
unsigned long lastWasteTime = 0;
const unsigned long COOLDOWN_MS = 7000;  // 7 seconds

// ============================
// SERVO POSITIONS (NORMAL SERVO)
// ============================
#define SERVO_DRY        90
#define SERVO_WET        30
#define SERVO_RECYCLE   150
#define SERVO_HAZARD    170

// ============================
// SETUP
// ============================
void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  binServo.attach(SERVO_PIN);
  binServo.write(SERVO_DRY); // Default position

  connectWiFi();

  Serial.println("=================================");
  Serial.println("ESP32 WASTE CONTROLLER READY");
  Serial.println("Waiting for waste...");
  Serial.println("=================================");
}

// ============================
// MAIN LOOP
// ============================
void loop() {

  unsigned long now = millis();

  // Cooldown protection
  if (now - lastWasteTime < COOLDOWN_MS) {
    delay(200);
    return;
  }

  int d = distanceCM();

  if (d > 0 && d < 15 && !busy) {
    busy = true;
    lastWasteTime = now;

    Serial.println("\n🗑 Waste detected");

    notifyBackendWasteDetected();

    delay(2000);  // wait for ESP32-CAM + backend

    String wasteType = getWasteTypeFromBackend();
    Serial.print("🧠 Waste Type Received: ");
    Serial.println(wasteType);

    rotateBin(wasteType);

    delay(3000);        // allow waste to fall

    // Return to default position
    binServo.write(SERVO_DRY);

    Serial.println("🔄 Ready for next waste");
    busy = false;
  }

  delay(200);
}

// ============================
// WIFI CONNECT
// ============================
void connectWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("📡 Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Wi-Fi Connected");
  Serial.print("📍 ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

// ============================
// ULTRASONIC DISTANCE
// ============================
int distanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long t = pulseIn(ECHO_PIN, HIGH, 30000);
  if (!t) return -1;

  return t * 0.034 / 2;
}

// ============================
// NOTIFY BACKEND
// ============================
void notifyBackendWasteDetected() {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ Wi-Fi Disconnected → cannot notify backend");
    return;
  }

  HTTPClient http;
  http.begin(wasteDetectedURL);

  int code = http.POST("");
  http.end();

  if (code == 200) {
    Serial.println("📨 Backend notified: waste_detected");
  } else {
    Serial.println("⚠ Failed to notify backend");
  }
}

// ============================
// GET WASTE TYPE
// ============================
String getWasteTypeFromBackend() {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ Wi-Fi Disconnected → default DRY");
    return "dry";
  }

  HTTPClient http;
  http.begin(getWasteURL);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String response = http.getString();
    response.trim();
    http.end();
    return response;
  }

  http.end();
  Serial.println("⚠ Backend Error → default DRY");
  return "dry";
}

// ============================
// SERVO CONTROL (NORMAL SERVO)
// ============================
void rotateBin(String waste) {

  Serial.print("🔄 Rotating bin for: ");
  Serial.println(waste);

  if (waste == "wet") {
    binServo.write(SERVO_WET);
  }
  else if (waste == "recyclable") {
    binServo.write(SERVO_RECYCLE);
  }
  else if (waste == "hazardous") {
    binServo.write(SERVO_HAZARD);
  }
  else { // dry
    binServo.write(SERVO_DRY);
  }
}
