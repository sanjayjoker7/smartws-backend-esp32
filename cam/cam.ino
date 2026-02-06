#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// ============================
// WIFI
// ============================
const char* ssid = "SANJAY";
const char* password = "12345678";

// ============================
// BACKEND APIs
// ============================
const char* predictUrl = "http://10.172.167.52:5000/predict_waste";
const char* shouldCaptureUrl = "http://10.172.167.52:5000/should_capture";

// ============================
// SETUP
// ============================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== ESP32-CAM START ===");

  // ============================
  // CAMERA CONFIG
  // ============================
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size   = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count     = 1;

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("❌ Camera init failed");
    while (true);
  }

  Serial.println("✅ Camera initialized");

  // ============================
  // WIFI CONNECT
  // ============================
  WiFi.begin(ssid, password);
  Serial.print("📡 Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected");
  Serial.print("📍 IP: ");
  Serial.println(WiFi.localIP());
}

// ============================
// MAIN LOOP
// ============================
void loop() {

  if (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    return;
  }

  if (shouldCapture()) {
    Serial.println("📸 Capture trigger received");
    captureAndSend();
    delay(3000);  // debounce
  }

  delay(500);  // polling delay
}

// ============================
// CHECK WITH BACKEND
// ============================
bool shouldCapture() {

  HTTPClient http;
  http.begin(shouldCaptureUrl);

  int code = http.GET();
  if (code == 200) {
    String response = http.getString();
    response.trim();
    http.end();

    return response == "YES";
  }

  http.end();
  return false;
}

// ============================
// CAPTURE + SEND IMAGE
// ============================
void captureAndSend() {

  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("❌ Camera capture failed");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  http.begin(client, predictUrl);
  http.addHeader("Content-Type", "image/jpeg");

  int code = http.POST(fb->buf, fb->len);

  if (code == 200) {
    Serial.println("✅ Image sent to backend");
  } else {
    Serial.print("❌ HTTP Error: ");
    Serial.println(code);
  }

  http.end();
  esp_camera_fb_return(fb);
}
