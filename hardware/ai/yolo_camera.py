#!/usr/bin/env python3
"""Run a custom YOLOv8 model against a webcam and emit detection summaries.

Install: pip install -r hardware/ai/requirements-yolo.txt
Example: python hardware/ai/yolo_camera.py --weights runs/detect/train/weights/best.pt --camera 0

The weights file must be trained for the waste labels you expect. COCO pretrained
weights are not a substitute for a waste-specific trained model.
"""
from __future__ import annotations

import argparse
import json
import time

import cv2
from ultralytics import YOLO


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", required=True, help="Path to custom YOLO .pt weights")
    parser.add_argument("--camera", type=int, default=0, help="OpenCV camera index")
    parser.add_argument("--confidence", type=float, default=0.50)
    parser.add_argument("--show", action="store_true", help="Display annotated camera frames")
    args = parser.parse_args()

    model = YOLO(args.weights)
    camera = cv2.VideoCapture(args.camera)
    if not camera.isOpened():
        raise SystemExit(f"Could not open camera index {args.camera}")

    try:
        while True:
            ok, frame = camera.read()
            if not ok:
                print(json.dumps({"error": "camera_frame_unavailable"}), flush=True)
                time.sleep(0.2)
                continue

            result = model.predict(frame, conf=args.confidence, verbose=False)[0]
            detections = []
            for box in result.boxes:
                class_id = int(box.cls.item())
                detections.append({
                    "class_id": class_id,
                    "class_name": model.names[class_id],
                    "confidence": round(float(box.conf.item()), 4),
                    "xyxy": [round(float(v), 1) for v in box.xyxy[0].tolist()],
                })

            print(json.dumps({
                "timestamp_unix": time.time(),
                "object_count": len(detections),
                "detections": detections,
            }), flush=True)

            if args.show:
                annotated = result.plot()
                cv2.imshow("NCSC YOLOv8 Waste Detection", annotated)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
    finally:
        camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
