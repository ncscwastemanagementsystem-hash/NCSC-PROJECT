/*
 * NCSC sorter actuator demonstration (ESP32).
 *
 * Serial commands: CATEGORY:<label>\n
 * Labels: organic, plastic, paper_cardboard, glass, e_waste, metal,
 *         other_residual, reject_manual
 *
 * SAFETY: Servo-only bench demo. No conveyor motor output is implemented.
 * Verify board pinout, servo supply and mechanical clearances before use.
 * Do not connect mains voltage or a motor directly to an ESP32 GPIO.
 */
#include <ESP32Servo.h>

constexpr int SERVO_PIN = 18;
constexpr int CLOSED_ANGLE = 90;
constexpr unsigned long GATE_HOLD_MS = 700;

Servo diverter;
String inputLine;

struct Route {
  const char* label;
  int angle;
};

const Route routes[] = {
  {"organic", 15},
  {"plastic", 35},
  {"paper_cardboard", 55},
  {"glass", 75},
  {"e_waste", 105},
  {"metal", 125},
  {"other_residual", 145},
  {"reject_manual", 165}
};

void closeGate() {
  diverter.write(CLOSED_ANGLE);
}

bool routeCategory(const String& category) {
  for (const Route& route : routes) {
    if (category.equals(route.label)) {
      diverter.write(route.angle);
      Serial.print("ACK:ROUTED:");
      Serial.println(route.label);
      delay(GATE_HOLD_MS);
      closeGate();
      Serial.println("GATE:CLOSED");
      return true;
    }
  }
  Serial.println("ERR:UNKNOWN_CATEGORY");
  closeGate();
  return false;
}

void setup() {
  Serial.begin(115200);
  diverter.setPeriodHertz(50);
  diverter.attach(SERVO_PIN, 500, 2400);
  closeGate();
  Serial.println("NCSC_SERVO_DEMO_READY");
}

void loop() {
  while (Serial.available()) {
    const char ch = static_cast<char>(Serial.read());
    if (ch == '\n' || ch == '\r') {
      inputLine.trim();
      if (inputLine.startsWith("CATEGORY:")) {
        routeCategory(inputLine.substring(9));
      } else if (inputLine.length() > 0) {
        Serial.println("ERR:USE_CATEGORY_LABEL");
      }
      inputLine = "";
    } else if (inputLine.length() < 80) {
      inputLine += ch;
    } else {
      inputLine = "";
      Serial.println("ERR:COMMAND_TOO_LONG");
    }
  }
}
