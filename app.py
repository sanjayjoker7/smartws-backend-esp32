import datetime
import os
import io
import numpy as np

from flask import Flask, jsonify, request
from PIL import Image
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConfigurationError, ServerSelectionTimeoutError, OperationFailure

# =========================
# BASIC SETUP
# =========================
load_dotenv()
app = Flask(__name__)

# =========================
# DATABASE CONFIG
# =========================
mongo_uri = os.getenv("MONGO_URI")

db = None
memory_waste_logs = []

if mongo_uri:
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        db = client.smart_waste_db
        print("[DB] Connected to MongoDB")
    except (ConfigurationError, ServerSelectionTimeoutError, OperationFailure) as exc:
        db = None
        print("[DB] Mongo disabled:", exc)
else:
    print("[DB] No MONGO_URI → memory mode")

# =========================
# SYSTEM CONFIG
# =========================
CLASS_NAMES = ["hazardous", "recycle", "reject", "wet"]

# =========================
# AI MODEL SETUP
# =========================
DUMMY_MODE = False
MODEL_PATH = "C:/Users/sanja/runs/detect/runs/detect/waste_train_balanced2/weights/best.pt"
model = None

def load_model():
    """Load YOLOv8 model lazily on first prediction"""
    global model, DUMMY_MODE
    if model is None and not DUMMY_MODE:
        try:
            print("[AI] Loading YOLOv8 model...")
            from ultralytics import YOLO
            model = YOLO(MODEL_PATH)
            print(f"[AI] Model loaded: {MODEL_PATH}")
            print(f"[AI] Classes: {CLASS_NAMES}")
            return model
        except Exception as e:
            print(f"[ERROR] Model load failed: {e}")
            print("[MODE] Falling back to DUMMY mode")
            DUMMY_MODE = True
            return None
    return model

# =========================
# SHARED STATE (IMPORTANT)
# =========================
latest_prediction = {
    "waste_type": "dry",
    "timestamp": None
}

capture_required = False   # 🔥 NEW FLAG

# =========================
# ROUTES
# =========================
@app.route("/")
def home():
    return "Smart Waste Backend Running"


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "db_connected": db is not None,
        "dummy_mode": DUMMY_MODE
    })


# =====================================================
# ESP32 → NOTIFY WASTE ARRIVAL
# =====================================================
@app.route("/waste_detected", methods=["POST"])
def waste_detected():
    global capture_required
    capture_required = True
    print("[EVENT] Waste detected → capture_required = TRUE")
    return jsonify({"status": "ok"}), 200


# =====================================================
# ESP32-CAM → ASK IF SHOULD CAPTURE
# =====================================================
@app.route("/should_capture", methods=["GET"])
def should_capture():
    global capture_required

    if capture_required:
        print("[SYNC] Camera capture allowed")
        return "YES", 200
    else:
        return "NO", 200


# =====================================================
# ESP32-CAM → IMAGE UPLOAD
# =====================================================
@app.route("/predict_waste", methods=["POST"])
def predict_waste():
    global capture_required

    try:
        print("\n[INFO] /predict_waste called")

        raw_bytes = request.get_data()
        if not raw_bytes:
            print("[ERROR] No image received")
            return jsonify({"error": "no image"}), 400

        image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        print("[OK] Image decoded:", image.size)

        # ---------- AI PREDICTION ----------
        current_model = load_model()
        
        
        if DUMMY_MODE or current_model is None:
            # Dummy mode fallback
            predicted_class = "hazardous"
            confidence = 0.50
            print("[DUMMY] Using dummy prediction")
        else:
            # Real AI inference
            results = current_model.predict(image, conf=0.25, verbose=False)
            
            if len(results) > 0 and len(results[0].boxes) > 0:
                # Get highest confidence detection
                boxes = results[0].boxes
                confidences = boxes.conf.cpu().numpy()
                classes = boxes.cls.cpu().numpy().astype(int)
                
                # DEBUG: Print all detections
                print(f"[DEBUG] All detections: {len(boxes)} objects")
                for i, (cls, conf) in enumerate(zip(classes, confidences)):
                    print(f"  [{i}] Class {cls} ({CLASS_NAMES[cls]}): {conf:.2%}")
                
                # Get best prediction
                best_idx = np.argmax(confidences)
                class_id = classes[best_idx]
                confidence = float(confidences[best_idx])
                predicted_class = CLASS_NAMES[class_id]
                
                print(f"[AI] Predicted: {predicted_class} (confidence: {confidence:.2%})")
                
                # Save debug image
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                debug_path = f"debug_images/{timestamp}_{predicted_class}.jpg"
                os.makedirs("debug_images", exist_ok=True)
                image.save(debug_path)
                print(f"[DEBUG] Saved image to {debug_path}")
            else:
                # No detection
                predicted_class = "reject"
                confidence = 0.30
                print("[AI] No waste detected, defaulting to reject")

        # ---------- BIN MAPPING ----------
        if predicted_class == "wet":
            bin_type = "wet"
            recyclable = False
        elif predicted_class == "recycle":
            bin_type = "recycle"
            recyclable = True
        elif predicted_class == "hazardous":
            bin_type = "hazardous"
            recyclable = False
        else:
            bin_type = "reject"
            recyclable = False

        # ---------- UPDATE CACHE ----------
        latest_prediction["waste_type"] = predicted_class
        latest_prediction["timestamp"] = datetime.datetime.now(datetime.timezone.utc)

        # ---------- RESET CAPTURE FLAG ----------
        capture_required = False
        print("[SYNC] capture_required reset to FALSE")

        # ---------- LOG DATA ----------
        waste_doc = {
            "waste_type": predicted_class,
            "bin_type": bin_type,
            "recyclable": recyclable,
            "confidence": confidence,
            "device_id": "BIN_01",
            "timestamp": latest_prediction["timestamp"]
        }  

        if db is not None:
            db.waste_logs.insert_one(waste_doc)
        else:
            memory_waste_logs.append(waste_doc)

        print("[SUCCESS] Prediction stored:", predicted_class)
        return jsonify({"status": "ok"}), 200

    except Exception as e:
        print("[FATAL ERROR]", str(e))
        return jsonify({"error": "internal error"}), 200


# =====================================================
# ESP32 → FETCH RESULT
# =====================================================
@app.route("/get_waste_type", methods=["GET"])
def get_waste_type():
    wt = latest_prediction.get("waste_type", "dry")
    latest_prediction["waste_type"] = "dry"
    return wt, 200


# =====================================================
# DASHBOARD DATA
# =====================================================
@app.route("/dashboard_data", methods=["GET"])
def dashboard_data():
    def count(bt):
        if db is not None:
            return db.waste_logs.count_documents({"bin_type": bt})
        else:
            return sum(1 for x in memory_waste_logs if x["bin_type"] == bt)

    if db is not None:
        total = db.waste_logs.count_documents({})
    else:
        total = len(memory_waste_logs)

    return jsonify({
        "total": total,
        "wet": count("wet"),
        "dry": count("dry"),
        "recycle": count("recycle"),
        "hazardous": count("hazardous")
    })

@app.route("/waste_logs", methods=["GET"])
def get_waste_logs():
    if db is not None:
        logs = list(db.waste_logs.find({}, {"_id": 0}))
        return jsonify(logs)
    else:
        return jsonify(memory_waste_logs)

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    print("\n[SERVER] Starting backend on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
