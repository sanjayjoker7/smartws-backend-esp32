# Smart Waste Management System

## Overview
This project is an IoT-based Smart Waste Management System that monitors, classifies, and analyzes waste collection in real-time. It uses ESP32 microcontrollers for monitoring, a Flask backend for the API and YOLOv8 machine learning inference, and a React-based frontend for a professional management dashboard.

---

## Features
- **Real-time Monitoring**: Live fill-level detection for multiple waste bins via ESP32.
- **AI Classification**: Automatic waste typing (Wet, Reject, Recyclable, Hazardous) using YOLOv8.
- **Unified Analytics**: Detailed collection history and "Real Count" dashboard displays.
- **Smart Alerts**: Notification system for full bins and collection pickups.
- **Secure Auth**: Dedicated admin login and authentication flow.

---

## Project Structure
```text
smartws-backend-esp32/
├── app.py                  # Main Flask backend API
├── requirements.txt        # Python backend dependencies
├── .gitignore              # Project ignore rules
├── training/               # ML training scripts & weights
│   ├── best.pt             # Trained YOLOv8 model weights
│   ├── train.py            # Model training script
│   ├── data.yaml           # Dataset configuration
│   └── ...                 # Accuracy checkers and converters
├── cam/                    # ESP32 camera firmware
├── esp32_main_controller/  # ESP32 main controller firmware
├── debug_images/           # Prediction logs for validation
└── frontend/               # React + TypeScript Web Application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── contexts/       # Global State (WasteData, Auth, Notifications)
    │   └── pages/          # Dashboard, Waste Status, Recyclable Storage
    └── ...
```

---

## Getting Started

### 1. Backend Setup
1. **Python Environment**: Use Python 3.8+
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Database**: Configure your `MONGO_URI` in a `.env` file.
4. **Run Server**:
   ```bash
   python app.py
   ```

### 2. Frontend Setup
1. **Navigate**: `cd frontend`
2. **Setup**:
   ```bash
   npm install
   npm run dev
   ```
3. **Access**: Open `http://localhost:8080`

---

## Database & Data Logic
The system uses a MongoDB backend to store:
- `waste_logs`: Individual classification events (timestamps, types, confidence).
- `bin_status`: Current fill levels and capacity data.

**Note**: The dashboard is configured to show **Total Lifetime Collection** as the primary count to ensure visibility of your historical classification data.

---

## Hardware Configuration
- **ESP32 Controller**: Monitors ultrasonic sensors for fill levels.
- **ESP32 Cam**: Captures images upon waste detection and uploads to `/predict_waste`.

---

## Requirements
- **Python 3.8+**
- **Node.js 18+**
- **MongoDB Atlas** (or local instance)
- **ESP32 & ESP32-CAM** hardware

---

## License
MIT License - Developed for Smart Waste Management Solutions.
