"""
Test the Flask API with a sample image from the test set
"""
import requests
import os

# Select a random test image
test_image_dir = "mainData/images/test"
test_images = [f for f in os.listdir(test_image_dir) if f.endswith(('.jpg', '.png'))]

if test_images:
    test_image = os.path.join(test_image_dir, test_images[0])
    print(f"Testing with: {test_image}")
    
    # Read image as bytes
    with open(test_image, 'rb') as f:
        image_bytes = f.read()
    
    # Send to Flask API
    url = "http://127.0.0.1:5000/predict_waste"
    print(f"\nSending POST request to {url}...")
    
    response = requests.post(url, data=image_bytes, headers={'Content-Type': 'application/octet-stream'})
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Body: {response.json()}")
    
    # Check latest prediction
    latest_url = "http://127.0.0.1:5000/latest_prediction"
    latest = requests.get(latest_url)
    print(f"\nLatest Prediction: {latest.json()}")
else:
    print("No test images found!")
