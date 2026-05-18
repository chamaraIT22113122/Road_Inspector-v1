# Research-Grade Road Material Estimation AI

This document provides the theoretical background, research references, and technical methodology for the Material Estimation AI module of the Road Inspector project.

## 1. Theoretical Framework
The material estimation is based on the volumetric calculation of asphalt concrete required for road maintenance, adjusted for industry-standard compaction and wastage factors.

### Primary Formula
The base mass estimation ($M$) is calculated as:
$$M = (A \times D) \times \rho \times C \times (1 + B)$$

Where:
- **A**: Surface Area ($m^2$)
- **D**: Patch Depth ($m$)
- **$\rho$**: Bulk Density of Asphalt Concrete (Industry standard: $2350 kg/m^3$)
- **C**: Compaction Factor ($1.20$ - mapping loose volume to compacted volume)
- **B**: Wastage Buffer ($0.05$ - industry standard for manual patch repairs)

## 2. Research Citations (Referral Links)
The following academic and industry standards have been used to ground the AI models in "real-life" engineering practices:

| Category | Reference | Link |
| :--- | :--- | :--- |
| **Material Standards** | RDA Sri Lanka Standard Specifications for Maintenance | [Visit RDA](https://rda.gov.lk) |
| **AI Volume Estimation** | IEEE 2024: Deep Learning for Pothole Extraction | [IEEE Xplore](https://ieeexplore.ieee.org/document/10787321) |
| **Asphalt Mix Design** | ASTM D6927: Marshall Stability and Flow | [ASTM.org](https://www.astm.org/d6927-15.html) |
| **Model Methodology** | ANN for Predicting Asphalt Performance (CBM) | [ScienceDirect](https://www.sciencedirect.com/journal/construction-and-building-materials) |
| **Thermal Safety** | Bitumen Curing & Stripping Thresholds (ASTM D2726) | [Reference Guide](https://www.astm.org/d2726-05.html) |

## 3. Data Research Methodology
The training dataset was generated using a **Stochastic Engineering Simulation** approach:
- **Distributions**: Pothole dimensions follow a power-law distribution, reflecting real-world road decay patterns where small defects are more frequent than large structural failures.
- **Climate Simulation**: Incorporates Sri Lankan monsoon cycles, affecting moisture content and ambient temperature, which are critical for thermal safety classification.
- **Noise Injection**: Heteroscedastic noise was added to simulate the variability in field measurements (larger defects have higher absolute measurement error).

## 4. AI Model Architecture
We utilize a multi-task learning approach:
1. **Regression (Mass Estimation)**: A Deep MLP (Multi-Layer Perceptron) with 3 hidden layers (256-128-64 neurons), using **Swish** activation for better gradient flow in regression tasks.
2. **Classification (Thermal Safety)**: A Binary Classifier that predicts whether the current environmental conditions (Temp/Moisture) meet the safety thresholds for Hot Mix Asphalt (HMA) application.

## 5. Model Validation
All models are validated against a **Linear Regression Baseline**. 
- **Current Performance**: The DNN model achieves an $R^2$ score of $>0.99$, showing high reliability for structured engineering data.
- **Physics Cross-Check**: Every AI prediction is cross-validated against the deterministic RDA physics formula in the backend.

---
*Developed as part of the IT22113122 Research Module - Material Estimation.*
