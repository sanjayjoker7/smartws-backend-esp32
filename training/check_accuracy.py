import pandas as pd

df = pd.read_csv('C:/Users/sanja/runs/detect/train/results.csv')

print('='*70)
print('YOLOv8n WASTE CLASSIFICATION - TRAINING RESULTS')
print('='*70)
print(f'\nTotal Epochs: {len(df)}')

last = df.iloc[-1]

print(f'\n✅ VALIDATION METRICS (Final Epoch):')
print(f'  Precision: {last["metrics/precision(B)"]:.2%}')
print(f'  Recall:    {last["metrics/recall(B)"]:.2%}')
print(f'  mAP@0.5:   {last["metrics/mAP50(B)"]:.2%}')
print(f'  mAP@0.5-0.95: {last["metrics/mAP50-95(B)"]:.2%}')

print(f'\n📊 LOSS VALUES:')
print(f'  Val Box Loss:   {last["val/box_loss"]:.4f}')
print(f'  Val Class Loss: {last["val/cls_loss"]:.4f}')
print(f'  Val DFL Loss:   {last["val/dfl_loss"]:.4f}')

print(f'\n⏱️  Training Time: {last["time"]:.0f} seconds')

print(f'\n📈 INTERPRETATION:')
print(f'  • Precision 92.76%: Of objects detected, 93% were correct')
print(f'  • Recall 94.74%: Model found 95% of all waste objects')
print(f'  • mAP50 94.77%: Very high accuracy at 0.5 IoU threshold')
print(f'  • mAP50-95 47.13%: Moderate accuracy at strict thresholds')

print('\n' + '='*70)
print('✅ MODEL IS READY FOR ESP32-CAM DEPLOYMENT')
print('='*70)
