"""
Convert YOLOv8 model to TensorFlow Lite for ESP32-CAM deployment
Optimizes model size and format for edge devices
"""
from ultralytics import YOLO
import os


def main():
    print('='*70)
    print('YOLOV8 → TENSORFLOW LITE CONVERSION FOR ESP32-CAM')
    print('='*70)
    
    # Load trained model
    model_path = 'C:/Users/sanja/runs/detect/train/weights/best.pt'
    print(f'\n📂 Loading model: {model_path}')
    model = YOLO(model_path)
    
    print('\n🔄 Converting to TensorFlow formats...')
    
    # Export to TensorFlow SavedModel first
    print('\n1️⃣ Exporting to TensorFlow SavedModel...')
    tf_path = model.export(format='saved_model', imgsz=640)
    print(f'   ✅ Saved: {tf_path}')
    
    # Export to TFLite (standard)
    print('\n2️⃣ Exporting to TensorFlow Lite (FP32)...')
    tflite_path = model.export(format='tflite', imgsz=640)
    print(f'   ✅ Saved: {tflite_path}')
    
    # Export to TFLite with INT8 quantization (smallest size)
    print('\n3️⃣ Exporting to TensorFlow Lite (INT8 quantized)...')
    try:
        tflite_int8_path = model.export(format='tflite', imgsz=640, int8=True)
        print(f'   ✅ Saved: {tflite_int8_path}')
    except Exception as e:
        print(f'   ⚠️ INT8 quantization failed: {e}')
        print('   Using FP32 version instead')
    
    # Get file sizes
    print('\n' + '='*70)
    print('MODEL SIZE COMPARISON')
    print('='*70)
    
    models = {
        'PyTorch (.pt)': 'C:/Users/sanja/runs/detect/train/weights/best.pt',
        'ONNX (.onnx)': 'C:/Users/sanja/runs/detect/train/weights/best.onnx',
        'TFLite (.tflite)': tflite_path if tflite_path else None
    }
    
    for name, path in models.items():
        if path and os.path.exists(path):
            size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f'{name:20} - {size_mb:.2f} MB')
    
    print('\n' + '='*70)
    print('✅ CONVERSION COMPLETE!')
    print('='*70)
    
    print('\n📝 NEXT STEPS:')
    print('   1. For Flask backend: Use PyTorch (.pt) or ONNX model')
    print('   2. For ESP32-CAM: Use TFLite (.tflite) model')
    print('   3. TFLite is optimized for microcontrollers')
    print('\n⚠️  NOTE: ESP32-CAM has limited memory (~4MB)')
    print('   Consider using model optimization or edge TPU if needed')
    print('='*70)


if __name__ == "__main__":
    main()
