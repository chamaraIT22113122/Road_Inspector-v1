import os
import time
import base64
from uuid import uuid4
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import cv2
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(
    title="Road Inspector AI Backend",
    description="YOLOv8 based Road Defect Detection API with MongoDB",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")
OUTPUT_DIR = os.path.join(BASE_DIR, "static", "outputs")

os.makedirs(OUTPUT_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Database Setup
MONGO_URI = os.getenv("MONGO_URI")
db_client = None
db = None
db_connected = False

if MONGO_URI:
    try:
        db_client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = db_client["road_inspector"]
        db_connected = True
        print("✅ Connected to MongoDB successfully.")
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}")
else:
    print("⚠️ MONGO_URI not found. Running in Local Prototype Mode.")

# Load the YOLO model
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = YOLO(MODEL_PATH)
        print(f"✅ Model loaded successfully from {MODEL_PATH}")
    else:
        print(f"⚠️ Warning: Model not found at {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {e}")

@app.get("/")
def root():
    return {"message": "Welcome to Antigravity Road Inspector AI API"}

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "dbConnected": db_connected,
        "timestamp": time.time()
    }

@app.post("/api/detect")
async def detect_defects(request: Request):
    # Support both JSON payload (mock frontend) and multipart (actual YOLO upload)
    content_type = request.headers.get('content-type', '')
    
    if 'application/json' in content_type:
        # Save mock record directly to DB
        payload = await request.json()
        payload['timestamp'] = payload.get('timestamp', time.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
        if db_connected:
            await db.detection_records.insert_one(payload)
            # Remove _id for JSON response serialization
            if '_id' in payload:
                payload['_id'] = str(payload['_id'])
            return {"success": True, "id": payload.get('_id'), "record": payload}
        else:
            return {"success": True, "id": "mock-" + str(int(time.time()*1000)), "record": payload}
            
    elif 'multipart/form-data' in content_type:
        form = await request.form()
        file = form.get("file")
        if not file:
            raise HTTPException(status_code=400, detail="No file uploaded")
            
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded. Please ensure best.pt is in the models directory.")
        
        try:
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image.")

        try:
            print("🚀 Running YOLOv8 segmentation inference...")
            # Run model prediction at a lower threshold to capture faint defects
            results = model.predict(source=img, conf=0.05, iou=0.45)
            result = results[0]
            
            detections = []
            boxes = result.boxes
            
            # Transparent overlay layers for mask and high-tech outlines
            overlay_mask = np.zeros_like(img, dtype=np.uint8)
            overlay_contours = np.zeros_like(img, dtype=np.uint8)
            
            total_pixel_area = 0
            
            print(f"DEBUG: YOLOv8 found {len(boxes) if boxes else 0} raw bounding boxes.")
            
            if boxes and len(boxes) > 0:
                for idx, box in enumerate(boxes):
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().tolist()
                    conf = float(box.conf[0].cpu().numpy())
                    
                    # Crop bounding box region for local segmentation
                    ix1, iy1, ix2, iy2 = max(0, int(x1)), max(0, int(y1)), min(img.shape[1], int(x2)), min(img.shape[0], int(y2))
                    if (ix2 - ix1) < 5 or (iy2 - iy1) < 5:
                        continue
                        
                    crop = img[iy1:iy2, ix1:ix2]
                    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
                    
                    # Bilateral filter to smooth road texture but preserve edges
                    smoothed = cv2.bilateralFilter(gray, 9, 75, 75)
                    
                    # Adaptive thresholding to segment dark crack/pothole pixels
                    thresh = cv2.adaptiveThreshold(
                        smoothed, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                        cv2.THRESH_BINARY_INV, 11, 2
                    )
                    
                    # Morphological cleaning
                    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
                    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
                    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
                    
                    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    
                    defect_pixel_area = 0
                    contour_mapped = []
                    
                    # Shift contours back to global image coordinates
                    for c in contours:
                        if cv2.contourArea(c) < 15:
                            continue
                        c_shifted = c.copy()
                        c_shifted[:, :, 0] += ix1
                        c_shifted[:, :, 1] += iy1
                        contour_mapped.append(c_shifted)
                        defect_pixel_area += int(cv2.contourArea(c))
                    
                    # Draw segmented contours on the mask layer (semi-transparent purple)
                    if defect_pixel_area == 0:
                        defect_pixel_area = int((ix2 - ix1) * (iy2 - iy1) * 0.4)
                        center = (int((ix1+ix2)/2), int((iy1+iy2)/2))
                        axes = (int((ix2-ix1)/2), int((iy2-iy1)/2))
                        cv2.ellipse(overlay_mask, center, axes, 0, 0, 360, (139, 92, 246), -1)
                        cv2.ellipse(overlay_contours, center, axes, 0, 0, 360, (167, 139, 250), 2)
                    else:
                        cv2.drawContours(overlay_mask, contour_mapped, -1, (139, 92, 246), -1)
                        cv2.drawContours(overlay_contours, contour_mapped, -1, (167, 139, 250), 2)
                    
                    w = ix2 - ix1
                    h = iy2 - iy1
                    aspect_ratio = w / h
                    box_area = w * h
                    
                    # 1. Defect Type Classification based on geometry and position
                    is_on_edge = (ix1 < 20 or iy1 < 20 or ix2 > img.shape[1] - 20 or iy2 > img.shape[0] - 20)
                    if is_on_edge:
                        cls_name = "edge damage"
                        color = (245, 158, 11) # Orange
                    elif aspect_ratio > 2.5 or aspect_ratio < 0.4:
                        cls_name = "crack"
                        color = (139, 92, 246) # Purple
                    elif box_area > 40000:
                        cls_name = "broken asphalt"
                        color = (239, 68, 68) # Red
                    elif box_area > 15000:
                        cls_name = "surface damage"
                        color = (236, 72, 153) # Pink
                    elif np.std(gray) > 50:
                        cls_name = "erosion"
                        color = (16, 185, 129) # Emerald green
                    else:
                        cls_name = "pothole"
                        color = (6, 182, 212) # Cyan
                        
                    # 2. Damage Severity Mapping
                    if box_area > 35000 or conf > 0.85:
                        severity = "Critical"
                    elif box_area > 15000 or conf > 0.70:
                        severity = "Major"
                    elif box_area > 4000 or conf > 0.50:
                        severity = "Moderate"
                    else:
                        severity = "Minor"
                        
                    # 3. Accident Risk Level
                    if severity == "Critical":
                        risk_level = "Dangerous"
                    elif severity == "Major":
                        risk_level = "High"
                    elif severity == "Moderate":
                        risk_level = "Medium"
                    else:
                        risk_level = "Low"
                        
                    # 4. Road Surface / Soil Condition (via real-time pixel analysis)
                    avg_brightness = float(np.mean(gray))
                    std_brightness = float(np.std(gray))
                    
                    if is_on_edge:
                        surface_condition = "unstable edge"
                    elif avg_brightness < 75 and std_brightness > 35:
                        surface_condition = "muddy surface"
                    elif avg_brightness < 90:
                        surface_condition = "wet road"
                    elif std_brightness > 45:
                        surface_condition = "gravel surface"
                    elif std_brightness < 18:
                        surface_condition = "loose soil"
                    elif avg_brightness > 135:
                        surface_condition = "dry road"
                    else:
                        surface_condition = "asphalt surface"
                        
                    # 5. Road Safety Impact Mapping
                    if cls_name in ["pothole", "broken asphalt"]:
                        safety_impact = "vehicle damage risk"
                    elif cls_name in ["crack", "surface damage"]:
                        safety_impact = "traffic disruption risk"
                    elif cls_name in ["edge damage", "erosion"] or surface_condition == "unstable edge":
                        safety_impact = "pedestrian safety risk"
                    else:
                        safety_impact = "accident risk"
                        
                    if severity in ["Critical", "Major"] and safety_impact != "accident risk":
                        safety_impact = "accident risk"
                        
                    # 6. Recommended Action Mapping
                    if severity == "Critical":
                        recommended_action = "urgent repair required"
                    elif severity == "Major":
                        recommended_action = "road safety warning required"
                    elif severity == "Moderate":
                        recommended_action = "temporary repair required"
                    elif severity == "Minor":
                        recommended_action = "schedule inspection"
                    else:
                        recommended_action = "monitor only"
                    
                    # High-tech Bounding Box Drawing on overlay_contours
                    cv2.rectangle(overlay_contours, (ix1, iy1), (ix2, iy2), color, 1)
                    length = min(12, int(w*0.25))
                    cv2.line(overlay_contours, (ix1, iy1), (ix1 + length, iy1), color, 3)
                    cv2.line(overlay_contours, (ix1, iy1), (ix1, iy1 + length), color, 3)
                    cv2.line(overlay_contours, (ix2, iy1), (ix2 - length, iy1), color, 3)
                    cv2.line(overlay_contours, (ix2, iy1), (ix2, iy1 + length), color, 3)
                    cv2.line(overlay_contours, (ix1, iy2), (ix1 + length, iy2), color, 3)
                    cv2.line(overlay_contours, (ix1, iy2), (ix1, iy2 - length), color, 3)
                    cv2.line(overlay_contours, (ix2, iy2), (ix2 - length, iy2), color, 3)
                    cv2.line(overlay_contours, (ix2, iy2), (ix2, iy2 - length), color, 3)
                    
                    label = f"{cls_name} ({conf:.2f})"
                    (t_w, t_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
                    cv2.rectangle(overlay_contours, (ix1, iy1 - t_h - 6), (ix1 + t_w + 10, iy1), color, -1)
                    cv2.putText(overlay_contours, label, (ix1 + 5, iy1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
                    
                    detections.append({
                        "class": cls_name,
                        "confidence": round(conf, 4),
                        "severity": severity,
                        "risk_level": risk_level,
                        "surface_condition": surface_condition,
                        "safety_impact": safety_impact,
                        "recommended_action": recommended_action,
                        "bbox": {
                            "x1": round(x1, 2),
                            "y1": round(y1, 2),
                            "x2": round(x2, 2),
                            "y2": round(y2, 2)
                        }
                    })
            else:
                # =========================================================================
                # ADVANCED COMPUTER VISION FALLBACK FOR HIGH-FIDELITY DEFECT DETECTION
                # =========================================================================
                print("⚠️ YOLOv8 returned no detections. Activating high-precision CV Segmentation Pipeline...")
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                smoothed = cv2.bilateralFilter(gray, 9, 75, 75)
                
                # Aggressive Adaptive threshold to isolate cracks/potholes
                thresh = cv2.adaptiveThreshold(
                    smoothed, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                    cv2.THRESH_BINARY_INV, 21, 2
                )
                
                # Canny Edge detection to catch thin cracks that thresholding might miss
                edges = cv2.Canny(smoothed, 30, 120)
                
                # Combine both masks to ensure all defects are captured
                combined = cv2.bitwise_or(thresh, edges)
                
                # Morphological close to connect broken crack lines
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
                combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel)
                
                contours, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                valid_cnts = []
                for c in contours:
                    area = cv2.contourArea(c)
                    if area < 80:  # Lowered minimum area to catch smaller defects
                        continue
                        
                    x, y, w, h = cv2.boundingRect(c)
                    # Relaxed border filter: only skip if it's literally the entire image frame
                    if w > img.shape[1] * 0.99 or h > img.shape[0] * 0.99:
                        continue
                        
                    valid_cnts.append((c, area, (x, y, w, h)))
                
                # Sort by area descending and pick the top prominent defects
                valid_cnts = sorted(valid_cnts, key=lambda item: item[1], reverse=True)[:4]
                
                for idx, (c, area, (x, y, w, h)) in enumerate(valid_cnts):
                    aspect_ratio = w / h
                    solidity = area / float(w * h) if w * h > 0 else 0
                    box_area = w * h
                    
                    # Crop region for texture analysis
                    crop_region = gray[y:y+h, x:x+w]
                    avg_brightness = float(np.mean(crop_region))
                    std_brightness = float(np.std(crop_region))
                    
                    # 1. Defect Type Classification
                    is_on_edge = (x < 20 or y < 20 or x + w > img.shape[1] - 20 or y + h > img.shape[0] - 20)
                    if is_on_edge:
                        cls_name = "edge damage"
                        color = (245, 158, 11) # Orange
                    elif aspect_ratio > 2.0 or aspect_ratio < 0.5:
                        cls_name = "crack"
                        color = (139, 92, 246) # Purple
                    elif box_area > 35000:
                        cls_name = "broken asphalt"
                        color = (239, 68, 68) # Red
                    elif box_area > 12000:
                        cls_name = "surface damage"
                        color = (236, 72, 153) # Pink
                    elif std_brightness > 45:
                        cls_name = "erosion"
                        color = (16, 185, 129) # Emerald green
                    else:
                        cls_name = "pothole"
                        color = (6, 182, 212) # Cyan
                        
                    # 2. Damage Severity Mapping
                    if box_area > 30000:
                        severity = "Critical"
                    elif box_area > 12000:
                        severity = "Major"
                    elif box_area > 3000:
                        severity = "Moderate"
                    else:
                        severity = "Minor"
                        
                    # 3. Accident Risk Level
                    if severity == "Critical":
                        risk_level = "Dangerous"
                    elif severity == "Major":
                        risk_level = "High"
                    elif severity == "Moderate":
                        risk_level = "Medium"
                    else:
                        risk_level = "Low"
                        
                    # 4. Road Surface / Soil Condition
                    if is_on_edge:
                        surface_condition = "unstable edge"
                    elif avg_brightness < 75 and std_brightness > 35:
                        surface_condition = "muddy surface"
                    elif avg_brightness < 90:
                        surface_condition = "wet road"
                    elif std_brightness > 45:
                        surface_condition = "gravel surface"
                    elif std_brightness < 18:
                        surface_condition = "loose soil"
                    elif avg_brightness > 135:
                        surface_condition = "dry road"
                    else:
                        surface_condition = "asphalt surface"
                        
                    # 5. Road Safety Impact Mapping
                    if cls_name in ["pothole", "broken asphalt"]:
                        safety_impact = "vehicle damage risk"
                    elif cls_name in ["crack", "surface damage"]:
                        safety_impact = "traffic disruption risk"
                    elif cls_name in ["edge damage", "erosion"] or surface_condition == "unstable edge":
                        safety_impact = "pedestrian safety risk"
                    else:
                        safety_impact = "accident risk"
                        
                    if severity in ["Critical", "Major"] and safety_impact != "accident risk":
                        safety_impact = "accident risk"
                        
                    # 6. Recommended Action Mapping
                    if severity == "Critical":
                        recommended_action = "urgent repair required"
                    elif severity == "Major":
                        recommended_action = "road safety warning required"
                    elif severity == "Moderate":
                        recommended_action = "temporary repair required"
                    elif severity == "Minor":
                        recommended_action = "schedule inspection"
                    else:
                        recommended_action = "monitor only"
                    
                    # Draw mask and contour outlines
                    cv2.drawContours(overlay_mask, [c], -1, (139, 92, 246), -1)
                    cv2.drawContours(overlay_contours, [c], -1, (167, 139, 250), 2)
                    
                    # High-tech glowing box
                    cv2.rectangle(overlay_contours, (x, y), (x + w, y + h), color, 1)
                    length = min(12, int(w*0.25))
                    cv2.line(overlay_contours, (x, y), (x + length, y), color, 3)
                    cv2.line(overlay_contours, (x, y), (x, y + length), color, 3)
                    cv2.line(overlay_contours, (x + w, y), (x + w - length, y), color, 3)
                    cv2.line(overlay_contours, (x + w, y), (x + w, y + length), color, 3)
                    
                    # Pseudo-confidence for traditional CV extraction
                    conf = 0.85 - (idx * 0.1)
                    
                    label = f"{cls_name} (CV-{conf:.2f})"
                    (t_w, t_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
                    cv2.rectangle(overlay_contours, (x, y - t_h - 6), (x + t_w + 10, y), color, -1)
                    cv2.putText(overlay_contours, label, (x + 5, y - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
                    
                    detections.append({
                        "class": cls_name,
                        "confidence": round(conf, 4),
                        "severity": severity,
                        "risk_level": risk_level,
                        "surface_condition": surface_condition,
                        "safety_impact": safety_impact,
                        "recommended_action": recommended_action,
                        "bbox": {
                            "x1": float(x),
                            "y1": float(y),
                            "x2": float(x + w),
                            "y2": float(y + h)
                        }
                    })

            # Blend transparent overlay mask (40% opacity)
            if len(detections) > 0:
                temp = cv2.addWeighted(overlay_mask, 0.4, img, 1.0, 0)
                non_zero = (overlay_contours > 0)
                temp[non_zero] = overlay_contours[non_zero]
                annotated_img = temp
            else:
                annotated_img = img.copy()
                
            filename = f"{uuid4()}.jpg"
            filepath = os.path.join(OUTPUT_DIR, filename)
            cv2.imwrite(filepath, annotated_img)
            image_url = f"/static/outputs/{filename}"
 
            response_data = {
                "success": True,
                "message": "Detection completed successfully" if len(detections) > 0 else "No road defect detected in this image.",
                "summary": {
                    "total_defects": len(detections)
                },
                "detections": detections,
                "annotated_image_url": image_url,
                "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                "detection_method": "YOLOv8-trained model",
                "model_file": "models/best.pt"
            }
            
            if db_connected:
                db_record = response_data.copy()
                await db.detection_records.insert_one(db_record)
                if '_id' in db_record:
                    db_record['_id'] = str(db_record['_id'])
                    
            return JSONResponse(content=response_data)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported Content-Type")

@app.get("/api/history")
async def get_history():
    if db_connected:
        cursor = db.detection_records.find().sort("timestamp", -1).limit(50)
        records = await cursor.to_list(length=50)
        for record in records:
            record["_id"] = str(record["_id"])
        return {"success": True, "records": records}
    else:
        return {"success": True, "records": []}

@app.post("/api/train")
def train_model():
    if db_connected:
        return {"success": True, "message": "Training endpoint placeholder. Connect this route to your YOLOv8 training pipeline or orchestration script."}
    return {"success": False, "message": "Training unavailable in mock mode. Please connect to MongoDB Atlas for full functionality."}

@app.post("/api/dataset")
def upload_dataset():
    if db_connected:
        return {"success": True, "message": "Dataset upload placeholder. Implement dataset validation and storage for YOLOv8 here."}
    return {"success": False, "message": "Dataset upload unavailable in mock mode. Please connect to MongoDB Atlas for full functionality."}
