#!/usr/bin/env python3
"""Train/evaluate a Random Forest on labelled YOLO + sensor feature rows.

This is a sensor-fusion starter, not a YOLO image detector. Supply real,
synchronised, human-labelled CSV observations before drawing conclusions.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

TARGET = "final_category"
NUMERIC = [
    "yolo_confidence", "object_count", "metal_detected", "weight_g",
    "moisture_raw", "capacitive_raw", "color_r", "color_g", "color_b",
]
CATEGORICAL = ["yolo_class"]
ALLOWED_LABELS = {
    "organic", "plastic", "paper_cardboard", "glass", "e_waste",
    "metal", "other_residual", "reject_manual",
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="CSV of real labelled observations")
    parser.add_argument("--model", default="fusion_model.joblib")
    parser.add_argument("--test-size", type=float, default=0.25)
    args = parser.parse_args()

    data = pd.read_csv(args.csv)
    required = [TARGET, *CATEGORICAL]
    missing = [c for c in required if c not in data.columns]
    if missing:
        raise SystemExit(f"Missing required CSV columns: {', '.join(missing)}")

    # Keep only feature columns that actually exist in this dataset.
    numeric = [c for c in NUMERIC if c in data.columns]
    features = [*CATEGORICAL, *numeric]
    data = data.dropna(subset=[TARGET, *CATEGORICAL]).copy()
    unknown = sorted(set(data[TARGET].astype(str)) - ALLOWED_LABELS)
    if unknown:
        raise SystemExit(f"Unsupported labels: {unknown}. Use the documented category names.")
    if data[TARGET].nunique() < 2:
        raise SystemExit("Training requires at least two represented target categories.")
    if len(data) < 20:
        raise SystemExit("Collect more labelled examples before training (at least 20 rows for this demo).")

    X, y = data[features], data[TARGET].astype(str)
    counts = y.value_counts()
    stratify = y if counts.min() >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=42, stratify=stratify
    )

    transformers = [
        ("class", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
    ]
    if numeric:
        transformers.append(("numeric", "passthrough", numeric))
    prep = ColumnTransformer(transformers=transformers, remainder="drop")
    model = Pipeline([
        ("features", prep),
        ("classifier", RandomForestClassifier(
            n_estimators=300, min_samples_leaf=2,
            class_weight="balanced", random_state=42, n_jobs=-1
        )),
    ])
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print(f"Hold-out accuracy: {accuracy:.3f}")
    print("\nClassification report:")
    print(classification_report(y_test, predictions, zero_division=0))
    labels = sorted(set(y_test) | set(predictions))
    print("Confusion matrix (labels order below):")
    print(labels)
    print(confusion_matrix(y_test, predictions, labels=labels))

    output = Path(args.model)
    output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": model, "features": features, "labels": labels}, output)
    metrics_path = output.with_suffix(".metrics.json")
    metrics_path.write_text(json.dumps({
        "holdout_accuracy": accuracy,
        "features": features,
        "labels": labels,
        "rows": int(len(data)),
        "warning": "Metrics are meaningful only when the dataset is representative and independently split."
    }, indent=2), encoding="utf-8")
    print(f"Saved model: {output}")
    print(f"Saved metrics: {metrics_path}")


if __name__ == "__main__":
    main()
