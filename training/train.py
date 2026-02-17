from ultralytics import YOLO
import torch


def main():
    # Check GPU availability
    if torch.cuda.is_available():
        print("GPU detected:", torch.cuda.get_device_name(0))
        device = 0
    else:
        print("No GPU detected. Training will use CPU.")
        device = "cpu"

    # Load YOLOv8 model
    model = YOLO("yolov8n.pt")

    # Train with class balancing for better accuracy
    model.train(
        data="data.yaml",
        epochs=50,                    # More epochs for better learning
        imgsz=640,
        batch=-1,                     # Auto-detect best batch size
        device=device,
        project="runs/detect",
        name="waste_train_balanced",
        verbose=True,
        workers=0,
        patience=15,                  # Early stopping
        save=True,
        plots=True,
        val=True,
        mosaic=1.0,                   # Data augmentation
        close_mosaic=10,
        augment=True,                 # Enable augmentation
        degrees=10,                   # Random rotation
        translate=0.1,                # Random translation
        scale=0.5,                    # Random scaling
        flipud=0.5,                   # Vertical flip
        fliplr=0.5,                   # Horizontal flip
        hsv_h=0.015,                  # HSV hue
        hsv_s=0.7,                    # HSV saturation
        hsv_v=0.4                     # HSV value
    )

    # Export model for deployment
    model.export(format="onnx")


if __name__ == "__main__":
    main()