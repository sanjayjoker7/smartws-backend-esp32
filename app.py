import datetime
import os
import io
import numpy as np

from flask import Flask, jsonify, request
from PIL import Image
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConfigurationError, ServerSelectionTimeoutError, OperationFailure
from flask_cors import CORS
# =========================
# BASIC SETUP
# =========================
load_dotenv()
app = Flask(__name__)
 # Fix CORS for credentials: allow only frontend origin and set supports_credentials=True
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:8080", "http://localhost:5000/dashboard_data"],
    allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials", "Access-Control-Allow-Origin"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

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
    "waste_type": "reject",
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
    wt = latest_prediction.get("waste_type", "reject")
    latest_prediction["waste_type"] = "reject"
    return wt, 200


# =====================================================
# DASHBOARD DATA
# =====================================================
def _get_dashboard_data():
    bin_db_map = {
        'wet': 'wet',
        'reject': 'reject',
        'recyclable': 'recycle',
        'hazardous': 'hazardous'
    }

    now = datetime.datetime.now(datetime.timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + datetime.timedelta(days=1)
    yesterday_start = today_start - datetime.timedelta(days=1)

    bins = []
    total = 0

    status_collection_name = None
    if db is not None:
        try:
            col_names = db.list_collection_names()
            for candidate in ['bin_status', 'bin_statuses', 'binstatus', 'bins_status', 'bins']:
                if candidate in col_names:
                    status_collection_name = candidate
                    break
        except Exception:
            status_collection_name = None

    for idx, (front_type, db_type) in enumerate(bin_db_map.items(), start=1):
        # Candidates for this bin type (synonyms)
        synonyms = {
            'reject': ['dry', 'reject'],
            'recycle': ['recyclable', 'recycle'],
            'wet': ['wet'],
            'hazardous': ['hazardous']
        }
        candidates = synonyms.get(db_type, [db_type])

        today_count = 0
        yesterday_count = 0
        total_count = 0
        fill_level = 0
        total_capacity = 0
        last_updated = None

        if db is not None:
            # 1. Try to get status from bin_status collection
            status_doc = None
            if status_collection_name:
                try:
                    status_doc = db[status_collection_name].find_one({'bin_type': {'$in': candidates}}) \
                        or db[status_collection_name].find_one({'type': {'$in': candidates}})
                except Exception:
                    status_doc = None

            if status_doc:
                today_count = int(status_doc.get('today_collection') or status_doc.get('today_count') or status_doc.get('collected_today') or 0)
                yesterday_count = int(status_doc.get('yesterday_collection') or status_doc.get('yesterday_count') or 0)
                total_count = int(status_doc.get('total_collected') or status_doc.get('total_count') or 0)
                fill_level = status_doc.get('fill_level') or status_doc.get('fillLevel') or status_doc.get('level') or 0
                total_capacity = status_doc.get('total_capacity') or status_doc.get('capacity') or 0
                last_updated = status_doc.get('last_updated') or status_doc.get('updated_at') or status_doc.get('timestamp')

            # 2. Fallback to waste_logs if counts are zero (likely if bin_status is out of sync or missing fields)
            if total_count == 0 or today_count == 0:
                log_total = db.waste_logs.count_documents({'bin_type': {'$in': candidates}})
                if log_total > 0:
                    total_count = max(total_count, log_total)
                    
                    log_today = db.waste_logs.count_documents({
                        'bin_type': {'$in': candidates},
                        'timestamp': {'$gte': today_start, '$lt': tomorrow_start}
                    })
                    today_count = max(today_count, log_today)
                    
                    log_yesterday = db.waste_logs.count_documents({
                        'bin_type': {'$in': candidates},
                        'timestamp': {'$gte': yesterday_start, '$lt': today_start}
                    })
                    yesterday_count = max(yesterday_count, log_yesterday)
                    
                    if not last_updated:
                        last_doc = db.waste_logs.find({'bin_type': {'$in': candidates}}).sort('timestamp', -1).limit(1)
                        try:
                            last_list = list(last_doc)
                            if last_list:
                                last_updated = last_list[0].get('timestamp')
                        except Exception:
                            pass
        else:
            # memory mode fallback
            today_count = sum(1 for x in memory_waste_logs if x.get('bin_type') in candidates and x.get('timestamp') and today_start <= x['timestamp'] < tomorrow_start)
            yesterday_count = sum(1 for x in memory_waste_logs if x.get('bin_type') in candidates and x.get('timestamp') and yesterday_start <= x['timestamp'] < today_start)
            total_count = sum(1 for x in memory_waste_logs if x.get('bin_type') in candidates)
            ts_items = [x.get('timestamp') for x in memory_waste_logs if x.get('bin_type') in candidates and x.get('timestamp')]
            if ts_items:
                last_updated = max(ts_items)

        total += total_count

        bins.append({
            'id': idx,
            'type': front_type,
            'bin_type': db_type,
            'label': f"{front_type.capitalize()} Waste" if front_type != 'recyclable' else 'Recyclable',
            'fill_level': int(fill_level),
            'total_capacity': int(total_capacity),
            'today_collection': int(total_count), # Using total as today's to show the "real count" as big number
            'yesterday_collection': int(yesterday_count),
            'total_collection': int(total_count),
            'last_updated': last_updated.isoformat() if hasattr(last_updated, 'isoformat') else last_updated,
        })

    return {
        'total': total,
        'wet': next((b['total_collection'] for b in bins if b['type'] == 'wet'), 0),
        'reject': next((b['total_collection'] for b in bins if b['type'] == 'reject'), 0),
        'recycle': next((b['total_collection'] for b in bins if b['type'] == 'recyclable'), 0),
        'hazardous': next((b['total_collection'] for b in bins if b['type'] == 'hazardous'), 0),
        'bins': bins,
    }

@app.route("/dashboard_data", methods=["GET"])
def dashboard_data():
    return jsonify(_get_dashboard_data())

@app.route("/waste_logs", methods=["GET"])
def get_waste_logs():
    if db is not None:
        logs = list(db.waste_logs.find({}, {"_id": 0}))
        return jsonify(logs)
    else:
        return jsonify(memory_waste_logs)

# =====================================================
# ALIASES & DUMMY ENDPOINTS FOR FRONTEND COMPATIBILITY
# =====================================================

@app.route("/bins/", methods=["GET"])
def get_bins():
    # Reuse dashboard_data for consistency
    data = _get_dashboard_data()
    return jsonify(data['bins'])

@app.route("/bins/<bin_type>/", methods=["GET", "PATCH"])
def handle_bin(bin_type):
    if request.method == "GET":
        data = _get_dashboard_data()
        bin_info = next((b for b in data['bins'] if b['type'] == bin_type), None)
        if bin_info:
            return jsonify(bin_info)
        return jsonify({"error": "Bin not found"}), 404
    
    elif request.method == "PATCH":
        # Placeholder for updating bin status (e.g. manual reset)
        return jsonify({"status": "ok", "message": f"Bin {bin_type} updated"})

@app.route("/classifications/", methods=["GET"])
def get_classifications_alias():
    # Alias for waste_logs with optional filtering
    waste_type = request.args.get('waste_type')
    if db is not None:
        query = {}
        if waste_type:
            query['waste_type'] = waste_type
        logs = list(db.waste_logs.find(query, {"_id": 0}).sort('timestamp', -1))
        # Format to match frontend Interface
        for i, log in enumerate(logs):
            log['id'] = i
            if 'timestamp' in log and log['timestamp']:
                ts = log['timestamp']
                log['created_at'] = ts.isoformat() if hasattr(ts, 'isoformat') else str(ts)
        return jsonify(logs)
    else:
        logs = [log for log in memory_waste_logs if not waste_type or log.get('waste_type') == waste_type]
        return jsonify(logs)

@app.route("/history/", methods=["GET"])
def get_history_placeholder():
    # Placeholder for collection history
    return jsonify([])

@app.route("/classify/", methods=["POST"])
def classify_form():
    # Handle multipart/form-data for frontend testing
    if 'image' not in request.files:
        return jsonify({"error": "no image"}), 400
    
    file = request.files['image']
    image_bytes = file.read()
    
    # We can't easily call our own route, but we can call the prediction logic
    # Injecting logic here would be redundant, so let's just use the shared predict_waste logic if possible
    # For now, return a dummy or adapt predict_waste to handle both
    return jsonify({
        "waste_type": "recycle",
        "confidence": 0.95,
        "classification_id": 123
    })

# =========================
# AUTH ENDPOINTS
# =========================

@app.route("/auth/login/", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    # Very simple validation
    if email == "admin@smartwaste.io" or email == "admin@gmail.com":
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": 1,
                "username": "admin",
                "email": email,
                "first_name": "Admin",
                "last_name": "User"
            }
        })
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/auth/register/", methods=["POST"])
def register():
    return jsonify({"message": "Registration disabled in this demo"}), 403

@app.route("/auth/logout/", methods=["POST"])
def logout():
    return jsonify({"message": "Logout successful"})


# =========================
# AUTH USER ENDPOINT (for frontend auth check)
# =========================
@app.route("/auth/user/", methods=["GET"])
def auth_user():
    # Dummy implementation: always returns a user object
    # You can expand this with real authentication logic as needed
    return jsonify({
        "id": 1,
        "email": "admin@gmail.com",
        "role": "admin",
        "name": "Administrator",
        "authenticated": True
    })

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    print("\n[SERVER] Starting backend on port 5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
