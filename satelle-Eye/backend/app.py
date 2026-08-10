from __future__ import annotations

import io
import os
import time
from typing import Tuple

import numpy as np
from PIL import ExifTags, Image
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MULTICLASS_MODEL_PATH = os.environ.get(
    "SATELL_EYE_LANDCOVER_MODEL",
    "model/landcover_multiclass_64.keras",
)
BINARY_MODEL_PATH = os.environ.get(
    "SATELL_EYE_MODEL",
    "model/relu_unet_turahalli_64.keras",
)

CLASS_NAMES = [
    "Background / Unknown",
    "River / Water Body",
    "Vegetation / Forest",
    "Urban / Built-up Area",
    "Bare Land / Soil",
    "Cloud / Haze",
]


def read_gps(image: Image.Image) -> Tuple[float, float] | None:
    try:
        exif = image.getexif()
        if not exif:
            return None
        gps_tag = next((key for key, value in ExifTags.TAGS.items() if value == "GPSInfo"), None)
        if gps_tag is None or gps_tag not in exif:
            return None
        gps = exif.get_ifd(gps_tag)

        def dms(value):
            return float(value[0]) + float(value[1]) / 60.0 + float(value[2]) / 3600.0

        lat = dms(gps[2])
        lon = dms(gps[4])
        if gps.get(1) == "S":
            lat = -lat
        if gps.get(3) == "W":
            lon = -lon
        return lat, lon
    except Exception:
        return None


def classify_rgb_fallback(image: Image.Image):
    arr = np.asarray(image.convert("RGB").resize((256, 256))).astype(np.float32) / 255.0
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    brightness = arr.mean(axis=-1)
    saturation = (arr.max(axis=-1) - arr.min(axis=-1)) / (arr.max(axis=-1) + 1e-6)

    water = (b > r * 1.08) & (b > g * 1.02) & (brightness < 0.72)
    vegetation = (g > r * 1.08) & (g > b * 1.03) & (g > 0.18)
    cloud = (brightness > 0.82) & (saturation < 0.18)
    urban = (saturation < 0.18) & (brightness > 0.18) & (brightness < 0.72)
    bare = ~water & ~vegetation & ~cloud & (r > b * 1.05)

    masks = {
        CLASS_NAMES[1]: water,
        CLASS_NAMES[2]: vegetation,
        CLASS_NAMES[3]: urban,
        CLASS_NAMES[4]: bare,
        CLASS_NAMES[5]: cloud,
    }
    scores = {name: float(mask.mean()) for name, mask in masks.items()}
    label, score = max(scores.items(), key=lambda item: item[1])
    confidence = min(98.0, max(35.0, 55.0 + score * 45.0))
    return label, confidence, scores, "RGB heuristic fallback"


def try_multiclass_model(image: Image.Image):
    if not os.path.exists(MULTICLASS_MODEL_PATH):
        return None
    try:
        import tensorflow as tf

        model = tf.keras.models.load_model(MULTICLASS_MODEL_PATH, compile=False)
        shape = model.input_shape
        size = int(shape[1])
        channels = int(shape[-1])
        if channels != 3:
            return {
                "available": False,
                "reason": f"land-cover model expects {channels} channels; upload RGB imagery or train a 3-channel model",
            }

        array = np.asarray(image.convert("RGB").resize((size, size))).astype(np.float32) / 255.0
        probabilities = model.predict(array[None, ...], verbose=0)[0]
        pixel_labels = probabilities.argmax(axis=-1)
        mean_probabilities = probabilities.mean(axis=(0, 1))
        valid_count = min(len(CLASS_NAMES), len(mean_probabilities))
        scores = {
            CLASS_NAMES[index]: float(mean_probabilities[index])
            for index in range(1, valid_count)
        }
        dominant_index = int(np.argmax(mean_probabilities[:valid_count]))
        dominant_label = CLASS_NAMES[dominant_index]
        confidence = float(mean_probabilities[dominant_index] * 100.0)
        return {
            "available": True,
            "label": dominant_label,
            "confidence": confidence,
            "scores": scores,
            "modelName": "Satell-Eye Multi-Class U-Net",
            "maskShape": list(pixel_labels.shape),
            "classIds": sorted(set(int(value) for value in pixel_labels.flatten())),
        }
    except Exception as exc:
        return {"available": False, "reason": str(exc)}


def try_binary_unet(image: Image.Image):
    if not os.path.exists(BINARY_MODEL_PATH):
        return None
    try:
        import tensorflow as tf

        model = tf.keras.models.load_model(BINARY_MODEL_PATH, compile=False)
        channels = int(model.input_shape[-1])
        if channels != 3:
            return {
                "available": False,
                "reason": f"change model expects {channels} channels",
            }
        size = int(model.input_shape[1])
        array = np.asarray(image.convert("RGB").resize((size, size))).astype(np.float32) / 255.0
        prediction = model.predict(array[None, ...], verbose=0)[0, ..., 0]
        mask = prediction > 0.5
        return {
            "available": True,
            "positive_fraction": float(mask.mean()),
            "mean_probability": float(prediction.mean()),
        }
    except Exception as exc:
        return {"available": False, "reason": str(exc)}


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "multiclassModel": os.path.exists(MULTICLASS_MODEL_PATH),
        "binaryModel": os.path.exists(BINARY_MODEL_PATH),
    })


@app.post("/api/analyze")
def analyze():
    started = time.perf_counter()
    if "image" not in request.files:
        return jsonify({"error": "No image field supplied."}), 400

    try:
        image = Image.open(io.BytesIO(request.files["image"].read()))
        gps = read_gps(image)
        trained = try_multiclass_model(image)

        if trained and trained.get("available"):
            label = trained["label"]
            confidence = trained["confidence"]
            scores = trained["scores"]
            model_name = trained["modelName"]
            model_source = "trained multi-class U-Net"
        else:
            label, confidence, scores, model_name = classify_rgb_fallback(image)
            model_source = "RGB fallback"

        binary = try_binary_unet(image)

        if gps:
            location = f"GPS-tagged image ({gps[0]:.5f}°, {gps[1]:.5f}°)"
            coordinates = {"lat": gps[0], "lon": gps[1]}
        else:
            location = "Location unavailable — image has no GPS EXIF metadata"
            coordinates = {"lat": 0.0, "lon": 0.0}

        processing_time = time.perf_counter() - started
        score_values = {name: round(value * 100, 2) for name, value in scores.items()}

        return jsonify({
            "detectedClass": label,
            "classConfidence": round(confidence, 2),
            "location": location,
            "coordinates": coordinates,
            "confidence": round(confidence / 100.0, 4),
            "landCoverScores": score_values,
            "landmarks": [],
            "environmentalData": {
                "landUse": label,
                "vegetation": f"{score_values.get(CLASS_NAMES[2], 0):.1f}% model confidence",
                "waterBodies": f"{score_values.get(CLASS_NAMES[1], 0):.1f}% model confidence",
                "urbanDensity": f"{score_values.get(CLASS_NAMES[3], 0):.1f}% model confidence",
                "deforestation": "Binary change model available." if binary and binary.get("available") else "No compatible change model loaded.",
                "naturalDisasters": "Classification is not a disaster confirmation.",
            },
            "recommendations": [
                "Use the trained multi-class U-Net for river, forest, urban and soil segmentation.",
                "Use georeferenced Sentinel-2 data when exact map coordinates are required.",
                "Use multispectral bands and temporal imagery for production disaster and deforestation detection.",
            ],
            "aiModelData": {
                "modelName": model_name,
                "architecture": "Multi-class U-Net" if model_source == "trained multi-class U-Net" else "RGB fallback",
                "accuracy": round(confidence, 2) if model_source == "trained multi-class U-Net" else 0,
                "processingTime": processing_time,
                "dataPoints": 256 * 256,
                "inputShape": "(64, 64, 3)" if model_source == "trained multi-class U-Net" else "(256, 256, 3)",
                "outputShape": "6 land-cover classes",
                "parameters": 0,
                "source": model_source,
            },
            "modelLayers": [],
            "deforestationAnalysis": {
                "ndviDrop": 0,
                "deforestedArea": round((binary or {}).get("positive_fraction", 0) * 100, 2),
                "healthyVegetation": score_values.get(CLASS_NAMES[2], 0),
                "criticalZones": 0,
            },
            "segmentation": trained or binary,
        })
    except Exception as exc:
        return jsonify({"error": f"Could not analyze image: {exc}"}), 400


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False)
