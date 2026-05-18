# Road Inspector: AI-Based Repair Area Estimation

This module is part of the Road Inspector System, an AI & IoT-Based Road Defect Detection and Smart Road Maintenance platform. 
Specifically, this module focuses on **AI-Based Repair Area Estimation using Semantic Segmentation**.

## Core Features
- **YOLOv8 Semantic Segmentation**: Uses a trained YOLOv8 model (`best.pt`) to detect potholes, cracks, and road depressions.
- **Area Calculation**: Extracts pixel masks to calculate the exact damaged pixel area and estimates real-world repair area (in square meters).
- **Severity Assessment**: Automatically assigns a severity level (Minor, Moderate, Major) and recommends repair actions based on the defect size.
- **Reporting & Export**: Dashboard provides a detailed report including bounding box coordinates, segmented imagery, JSON export, and PDF generation.
- **Module Handoff**: A single click pushes the structured report to the next module in the pipeline (Repair Area Estimation and Material Planning).

---

## 🚀 Future Enhancement: IoT Accident & Driving Behaviour Monitoring

*As discussed in the supervisor meeting, the following is a planned future improvement for the Road Inspector system and is **not currently implemented**.*

A dedicated IoT integration is planned for the next phase of development. A team member will develop an IoT hardware module (e.g., using ESP32/IMU/GPS sensors) to be installed in municipal vehicles. This device will capture real-time telemetry and report:
* **Accidents** (via shock and high-impact G-force detection)
* **Speeding** (via GPS and accelerometer data)
* **Reckless Driving** (via sudden deceleration or lateral G-forces)

These devices will automatically push telemetry data into our unified backend. The system will then generate emergency alerts, notify dispatchers, and plot incidents on a live dashboard map.

---

## Technical Stack
- **Frontend**: React (Vite), Framer Motion, Recharts
- **Backend**: Python (FastAPI), Ultralytics (YOLOv8), OpenCV, PyMongo/Motor
- **Database**: MongoDB Atlas
