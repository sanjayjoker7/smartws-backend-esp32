from ultralytics import YOLO


def main():
    # Load trained model
    model = YOLO('C:/Users/sanja/runs/detect/runs/detect/waste_train_balanced2/weights/best.pt')

    # Validate on test set
    results = model.val(data='data.yaml', split='test', imgsz=640, workers=0, plots=False, verbose=False)

    print('='*70)
    print('PER-CLASS WASTE DETECTION ACCURACY')
    print('='*70)

    # Class names
    class_names = {0: 'Hazardous', 1: 'Recycle', 2: 'Reject', 3: 'Wet'}

    # Extract metrics from results
    if hasattr(results, 'box'):
        print('\n✅ CLASS-WISE PRECISION (on test set):\n')
        if hasattr(results.box, 'p') and results.box.p is not None:
            for i, precision in enumerate(results.box.p):
                class_name = class_names.get(i, f'Class {i}')
                val = float(precision) if precision is not None else 0.0
                print(f'   {i}. {class_name:15} - {val:.2%}')

        print('\n✅ CLASS-WISE RECALL (on test set):\n')
        if hasattr(results.box, 'r') and results.box.r is not None:
            for i, recall in enumerate(results.box.r):
                class_name = class_names.get(i, f'Class {i}')
                val = float(recall) if recall is not None else 0.0
                print(f'   {i}. {class_name:15} - {val:.2%}')

        print('\n✅ CLASS-WISE mAP@50 (on test set):\n')
        if hasattr(results.box, 'ap50') and results.box.ap50 is not None:
            for i, ap50 in enumerate(results.box.ap50):
                class_name = class_names.get(i, f'Class {i}')
                val = float(ap50) if ap50 is not None else 0.0
                print(f'   {i}. {class_name:15} - {val:.2%}')

    # Print overall metrics
    print('\n' + '='*70)
    print('OVERALL TEST SET METRICS')
    print('='*70)
    if hasattr(results.box, 'map50'):
        print(f'mAP@50: {float(results.box.map50):.2%}')
    if hasattr(results.box, 'map'):
        print(f'mAP@50-95: {float(results.box.map):.2%}')
    print('='*70)


if __name__ == "__main__":
    main()
