# Physical Smart Waste-to-Resource System — Build and Use Guide

## 1. Scope: keep the two project parts distinct

The repository's existing web application is an NCSC Project Vault built with React, Vite and Express. It manages projects, uploaded files, experiment logs, a hardware bill of materials and audit records.

The **physical sorter described here is a proposed separate subsystem**. The current vault does not contain live sensor ingestion, YOLO inference, Random Forest inference, conveyor tracking or servo control. The files under `hardware/` are starter examples for developing that subsystem.

## 2. Proposed physical workflow

1. An operator loads a small batch of safe, dry demonstration items into the hopper.
2. A low-amplitude vibrating tray spreads items. It reduces overlap but does not guarantee one-item separation.
3. A guarded conveyor carries items through a fixed inspection zone.
4. An IR break-beam/photoelectric sensor detects item arrival and timestamps it.
5. A fixed RGB camera captures an image under consistent LED illumination.
6. YOLOv8n detects visible object classes and returns bounding boxes, class IDs and confidence scores.
7. ESP32 samples the sensors and sends a time-stamped feature record to the host computer.
8. A Python service joins the image prediction and sensor readings for the same tracked item.
9. A trained scikit-learn Random Forest uses structured features—not raw images—to provide a fused class prediction.
10. A decision policy checks confidence, sensor disagreement and safety flags. Uncertain or hazardous items go to manual inspection.
11. The host sends a category command to the ESP32. Conveyor position tracking determines when the item reaches the correct gate.
12. The gate moves, position feedback confirms the action, and the system logs the result and bin state.

## 3. Categories

Use a controlled label list in the dataset and firmware:

- `organic`
- `plastic`
- `paper_cardboard`
- `glass`
- `e_waste`
- `metal`
- `other_residual`
- `reject_manual`

Do not confuse material with object appearance. An inductive proximity sensor detects suitable metal, not e-waste as a semantic category. Moisture is supporting evidence only: wet paper, dirty plastic and liquid contamination can all produce high readings. Capacitive and colour sensors also cannot independently identify material reliably.

Batteries, aerosols, broken glass, sharp objects, unknown chemicals and suspicious items must bypass automatic actuation and be handled under an appropriate manual safety procedure. Do not crush or heat e-waste.

## 4. Recommended minimum sensor set

| Device | What it contributes | Important limitation |
|---|---|---|
| RGB camera | Visual object detection with YOLOv8n | Requires representative labelled images and stable lighting |
| IR break-beam/photoelectric sensor | Arrival trigger and timing | Does not identify material |
| Inductive proximity sensor | Metal-present flag | Does not identify alloy or prove e-waste |
| Load cell + HX711 | Static item mass at a weigh station | Do not weigh freely moving items without a designed weigh station |
| Moisture sensor | Supporting moisture feature | Wetness is not proof of organic material |
| Gate limit switches | Gate position feedback | Use fail-safe mechanical design |
| Bin-level ToF/ultrasonic sensor | Bin fill estimate | Irregular waste surfaces affect readings |
| Motor-current sensor | Detect possible overload/jam | Requires calibrated thresholds and electrical protection |

Optional later additions: RGB colour sensor, capacitive proximity sensor and calibrated NIR material sensor. Add them only when controlled tests show that they improve validation results.

## 5. AI architecture

### YOLOv8n: visual detection

Train YOLOv8n on images of the actual objects expected in the project. Include different lighting, colours, sizes, orientations, contamination and partially damaged items. Keep training, validation and test sets separated by physical item/session where possible to avoid near-duplicate leakage.

The detector provides a class and confidence score for visible objects. It does not measure moisture or weight.

### Random Forest: sensor/vision decision fusion

The Random Forest receives structured features such as:

- YOLO predicted class (encoded consistently)
- YOLO confidence
- detected object count
- metal-present flag
- calibrated static mass in grams, if available
- calibrated moisture reading
- optional capacitive and colour readings

It returns a fused category. Train it only from labelled, synchronised examples. Missing optional sensor values must be represented consistently; do not silently replace missing measurements with invented readings.

### Validation gate

The project's proposed minimum target is **at least 80% overall classification accuracy on an independent, representative test set** before automatic category selection is enabled. This is a target, not an achieved result. Also report per-class precision, recall, F1, confusion matrix, reject rate and physical routing success. An 80% overall score can hide poor performance on a rare but important category.

## 6. Data collection format

The starter training script expects a CSV with these columns:

```csv
yolo_class,yolo_confidence,object_count,metal_detected,weight_g,moisture_raw,capacitive_raw,color_r,color_g,color_b,final_category
plastic_bottle,0.94,1,0,18.2,312,0.41,34,118,202,plastic
```

The example row is illustrative only. Replace it with actual readings and human-verified labels. If a sensor is not installed, leave its column absent only if the training script is configured accordingly; never fabricate readings.

## 7. Hardware and electrical integration

- Use a separate, correctly rated motor driver for the conveyor motor; never drive a motor directly from an ESP32 pin.
- Use a suitable regulated supply for logic and a separately rated motor supply. Join grounds only according to the driver and isolation design.
- Provide an accessible emergency stop that removes actuator power through an appropriately designed safety circuit.
- Guard rollers, belt pinch points, vibration linkages and moving gates.
- Use gate limit switches and timeout handling. A command acknowledgement is not proof that a gate physically moved.
- Test first with LEDs and unloaded servo mechanisms, then inert demonstration objects.
- Keep glass, batteries, e-waste and hazardous items out of early conveyor tests.
- Do not connect the educational prototype to a pyrolysis vessel, heater, gas line or improvised biogas burner.

## 8. Run the Python model starter

From the repository root:

```bash
python -m venv .venv
# Windows:
.venv\\Scripts\\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r hardware/ai/requirements.txt
python hardware/ai/train_fusion_model.py --csv hardware/ai/sample_training_data.csv --model hardware/ai/fusion_model.joblib
```

The sample CSV contains synthetic demonstration rows solely to prove the script interface. It is **not** suitable for claiming accuracy or deploying a sorter. Replace it with a properly labelled dataset before evaluation.

## 9. ESP32 starter

Open `hardware/esp32/sorter_controller.ino` in Arduino IDE 2.x. Install the ESP32 board package and the ESP32Servo library. Select the correct board and serial port. Confirm pin assignments against the exact board and driver before uploading.

The example accepts serial category commands and moves a demonstration servo. It is not a complete conveyor controller: it does not implement calibrated item tracking, motor driver control, safety-rated emergency stop, or a complete gate interlock. Keep motors disconnected during initial testing.

## 10. End-to-end commissioning checklist

- [ ] Camera focus, lighting and field of view fixed.
- [ ] One object can be detected without overlap.
- [ ] IR trigger is stable and debounced.
- [ ] Load cell is tared and calibrated using known masses.
- [ ] Moisture sensor is calibrated for the chosen test protocol.
- [ ] Sensor records and camera detections share an item ID/timestamp.
- [ ] YOLO and fusion model evaluated on held-out samples.
- [ ] Reject path tested with unknown and conflicting examples.
- [ ] Conveyor travel time measured at each operating speed.
- [ ] Gate open/close positions confirmed by feedback.
- [ ] Bin-full and jam responses tested.
- [ ] Emergency stop and guarding inspected before any powered mechanical trial.

## 11. Reference documentation

- Ultralytics YOLO: https://docs.ultralytics.com/
- scikit-learn RandomForestClassifier: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
- Arduino IDE: https://docs.arduino.cc/software/ide/
- ESP32 Arduino core: https://docs.espressif.com/projects/arduino-esp32/en/latest/
- HX711 library documentation: https://docs.arduino.cc/libraries/hx711/
