# Antigravity Road Inspector AI Backend

This is the Python FastAPI backend for serving the YOLOv8 road defect detection model (`best.pt`).

## Directory Structure

```
ai_backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── models/              # Directory containing the trained YOLO model
│   └── best.pt          # Your trained YOLOv8 model file
└── static/
    └── outputs/         # Directory where processed images are saved
```

## Setup & Installation

1. Make sure you have Python 3.8+ installed.
2. Navigate to the `ai_backend` folder:
   ```bash
   cd RoadDefectDetection/ai_backend
   ```
3. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Ensure your trained `best.pt` model is placed in the `models/` directory.

## Running the Server

Start the FastAPI server using `uvicorn`:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

FastAPI automatically generates interactive API documentation. You can access it at:
* Swagger UI: `http://localhost:8000/docs`
* ReDoc: `http://localhost:8000/redoc`

### Example Request (Python)

```python
import requests

url = "http://localhost:8000/api/detect"
files = {'file': open('path/to/your/road_image.jpg', 'rb')}

response = requests.post(url, files=files)
print(response.json())
```

### Example Response

```json
{
  "success": true,
  "message": "Detection completed successfully",
  "summary": {
    "total_defects": 2
  },
  "detections": [
    {
      "class": "pothole",
      "confidence": 0.8943,
      "bbox": {
        "x1": 150.5,
        "y1": 200.2,
        "x2": 300.0,
        "y2": 450.8
      }
    },
    {
      "class": "crack",
      "confidence": 0.7521,
      "bbox": {
        "x1": 50.0,
        "y1": 100.0,
        "x2": 120.0,
        "y2": 150.0
      }
    }
  ],
  "annotated_image_url": "/static/outputs/8f14c278-65b1-40be-b519-79bcbc2d5c11.jpg"
}
```

## Frontend Integration

In your Antigravity frontend (e.g., React), you can upload an image using `FormData`:

```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8000/api/detect', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Detection Results:', data.detections);

// Display the processed image with bounding boxes
const imageUrl = `http://localhost:8000${data.annotated_image_url}`;
```
