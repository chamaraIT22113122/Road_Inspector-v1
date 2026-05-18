# 🛣️ Road Inspector v1
> **A Comprehensive AI-Powered Road Defect Detection, Traffic Scheduling, and Material Estimation Suite**

Welcome to **Road Inspector v1**, a state-of-the-art, multi-module research and development suite designed to revolutionize road maintenance, defect detection, and resource scheduling. This repository consolidates five specialized sub-projects into a unified workspace, integrating advanced Artificial Intelligence, modern Web Portals, and automated Cost & Material Estimation models.

---

## 📂 Project Suite Architecture

The repository is organized into five core modules, each addressing a critical pillar of automated road maintenance:

| Module / Component | Focus Area | Technology Stack |
| :--- | :--- | :--- |
| **`AI Road Defect Detection`** | High-precision computer vision models to identify potholes, cracks, and road degradation. | Python, PyTorch/TensorFlow, OpenCV |
| **`Repair Area Segmentation`** | Advanced semantic segmentation to calculate the precise area and depth of road damage. | Python, Segment Anything (SAM) / YOLO |
| **`Material & Cost Estimation`** | Automated RDA-compliant material estimation, financial analysis, and cost projection dashboard. | React, Vite, Node.js, Python AI Backend |
| **`Traffic Environment Scheduling`** | Intelligent scheduling and routing algorithms to minimize traffic disruption during repairs. | Java / Python, Scheduling Algorithms |
| **`Citizen Portal`** | Public engagement web app for citizens to report defects, submit photos, and track repair status. | React / Vue, Node.js Web App |

---

## 🚀 Module Overview

### 1. 🔍 AI Road Defect Detection
* **Location:** `road-inspector-IT22082756-AI-Road-Defect-Detection`
* **Features:**
  * Real-time image and video processing for defect detection.
  * Integration with edge devices and vehicle dashcams.
  * Multi-class classification of road anomalies.

### 2. 📐 Repair Area Segmentation
* **Location:** `road-inspector-IT22252340-Repair-Area-Segmentation`
* **Features:**
  * Pixels-to-meters surface area calculation for patch repairs.
  * 3D depth-map estimation using stereo imagery.
  * High-precision masking for precise volume calculation.

### 3. 📊 Material & Cost Estimation
* **Location:** `road-inspector-IT22113122-Material-Estimation`
* **Features:**
  * AI-driven material volume and cost prediction.
  * Complete CRUD capabilities for managing historical estimation logs.
  * Compliance with **RDA Sri Lanka** engineering standards.
  * Premium, responsive analytics dashboard.

### 4. 🚦 Traffic Environment Scheduling
* **Location:** `road-inspector-IT22207968-Traffic-Env-Scheduling`
* **Features:**
  * Traffic flow simulation and peak-hour avoidance scheduling.
  * Real-time routing updates for maintenance crews.
  * Dynamic dispatching based on priority and traffic congestion.

### 5. 👥 Citizen Portal
* **Location:** `road-inspector-citizen-portal`
* **Features:**
  * User-friendly, responsive interface for community reporting.
  * Location-tagging (GPS coordinates integration).
  * Automated ticketing and dispatch notification updates.


---

## 🛠️ Getting Started

To get started with any of the modules, navigate into the respective folder and follow the local instructions.

### Prerequisites
Make sure you have the following installed on your system:
* **Node.js** (v18 or higher) — for frontend portals
* **Python** (v3.10 or higher) — for AI backends and processing scripts
* **Git** — for version control

---

## 📦 How to Use this Repository

### 1. Version Control & Contributions
Each module runs independently but is tracked together under this repository for centralized version control.

### 2. Running a Frontend (Vite/React)
```bash
cd road-inspector-IT22113122-Material-Estimation/road-inspector-IT22113122-Material-Estimation
npm install
npm run dev
```

### 3. Running an AI Backend (Python/Flask)
```bash
cd road-inspector-IT22113122-Material-Estimation/road-inspector-IT22113122-Material-Estimation/MaterialEstimation/ai_backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python app.py
```

---

*Developed with ❤️ as part of the Road Inspector suite.*
