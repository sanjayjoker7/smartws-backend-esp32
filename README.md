# Smart Waste Management System

## Overview
This project is a Smart Waste Management System that leverages IoT, machine learning, and a modern web interface to monitor, classify, and analyze waste collection using ESP32 microcontrollers and a React-based frontend.

---

## Features
- **IoT Integration:** ESP32 microcontroller for real-time waste bin monitoring.
- **Machine Learning:** YOLO-based waste classification and analytics.
- **Web Dashboard:** React + TypeScript frontend for visualization and management.
- **API Backend:** Python Flask backend for data processing and ML inference.
- **Data Analytics:** Bin analytics, waste status, and notification system.

---

## Project Structure
```
smartws-backend-esp32/
├── app.py                  # Main Flask backend
├── train.py                # Model training script
├── convert_to_tflite.py    # Convert models to TFLite
├── check_accuracy.py       # Model accuracy checker
├── requirements.txt        # Python dependencies
├── cam/                    # ESP32 camera firmware
├── debug_images/           # Images for debugging
├── esp32_main_controller/  # ESP32 main controller firmware
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout components
│   │   ├── lib/            # API and utilities
│   │   └── pages/          # App pages
│   ├── public/             # Static files
│   └── ...
├── newData2/               # Dataset (images and labels)
└── ...
```

---

## Getting Started

### 1. Backend Setup
- Install Python 3.8+
- Create a virtual environment:
  ```bash
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Run the backend:
  ```bash
  python app.py
  ```

### 2. Frontend Setup
- Navigate to the frontend directory:
  ```bash
  cd frontend
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Start the development server:
  ```bash
  npm run dev
  ```

### 3. ESP32 Firmware
- Firmware source is in `cam/` and `esp32_main_controller/`.
- Use Arduino IDE or PlatformIO to flash the firmware to your ESP32.

---

## Model Training & Conversion
- Train YOLO model: `python train.py`
- Convert to TFLite: `python convert_to_tflite.py`
- Check accuracy: `python check_accuracy.py`

---

## Folder Descriptions
- **cam/**: ESP32 camera firmware (Arduino code)
- **esp32_main_controller/**: Main ESP32 controller firmware
- **frontend/**: React web app (dashboard, analytics, etc.)
- **newData2/**: Dataset for training/testing (images & labels)
- **debug_images/**: Images for debugging and validation

---

## Requirements
- Python 3.8+
- Node.js 18+
- ESP32 board
- Arduino IDE or PlatformIO (for firmware)

---

## License
[MIT License](LICENSE)

---

## Acknowledgements
- YOLOv8 by Ultralytics
- React, Vite, Tailwind CSS
- ESP32 by Espressif
