"""
Generate Research-Grade training data for the Material Estimation AI model.

This generator uses standards derived from the RDA (Road Development Authority) Sri Lanka 
and academic research on asphalt maintenance.

Research References:
1. RDA Standard Specifications for Construction and Maintenance of Roads and Bridges.
2. IEEE 2024: "Deep Learning Enhanced Feature Extraction of Potholes".
3. ASTM D6927: Standard Test Method for Marshall Stability and Flow of Asphalt Mixtures.

Key Parameters:
- Density (rho): 2300 - 2450 kg/m^3 (Typical for Sri Lankan AC - Asphalt Concrete)
- Compaction Factor: 1.15 - 1.25 (Bulk density vs Loose density)
- Bitumen Content: 4.5% - 5.5% (Penetration Grade 60/70)
- Thermal Safety: Based on ASTM guidelines for HMA application.
"""

import numpy as np
import pandas as pd
import os

# Set seed for reproducibility
np.random.seed(42)
N = 50000  # Increased for research-level training

# ----- Engineering Constants (RDA & Research Based) -----
DENSITY_AC = 2350.0       # Standard density for Asphalt Concrete in Sri Lanka (kg/m3)
COMPACTION_FACTOR = 1.2   # 20% volume reduction upon compaction
WASTAGE_BUFFER = 0.05     # 5% industry standard for small patch repairs
BITUMEN_RATIO = 0.052     # 5.2% target binder content

# ----- Feature Simulation (Real-World Distributions) -----
# Length/Width: Power-law like distribution for potholes (more small ones, fewer large)
length = np.random.exponential(scale=1.0, size=N) + 0.1
length = np.clip(length, 0.1, 5.0)

width = np.random.exponential(scale=0.8, size=N) + 0.1
width = np.clip(width, 0.1, 3.5)

# Depth: Normal distribution based on RDA patch repair standards (typical 40mm - 100mm)
depth = np.random.normal(loc=0.06, scale=0.02, size=N)
depth = np.clip(depth, 0.02, 0.20)

# Climate: Sri Lankan Tropical Conditions
# Higher moisture during monsoon simulations
is_monsoon = np.random.choice([0, 1], size=N, p=[0.7, 0.3])
ambient_temp = np.where(is_monsoon, 
                        np.random.normal(27, 2, N), # Monsoon: cooler, stable
                        np.random.normal(32, 4, N)) # Dry: hotter, variable
ambient_temp = np.clip(ambient_temp, 18, 45)

surface_moisture = np.where(is_monsoon,
                            np.random.uniform(10, 40, N), # Wet
                            np.random.uniform(0.5, 12, N)) # Dry

# ----- Derived Features -----
area = length * width

# Defect Severity (RDA Maintenance Manual Mapping)
# 0: Routine (Shallow), 1: Major (Medium), 2: Critical (Deep/Structural)
severity = np.where(depth < 0.05, 0, np.where(depth < 0.10, 1, 2))

# ----- Target Calculation (Physics + Engineering Factors) -----
# Formula: Mass = Area * Depth * Density * Compaction * (1 + Wastage)
theoretical_mass = (area * depth) * DENSITY_AC * COMPACTION_FACTOR * (1 + WASTAGE_BUFFER)

# Add Precision Noise (minimal variance for high-accuracy research)
noise_factor = np.random.normal(0, 0.001, N) 
mass_required = theoretical_mass * (1 + noise_factor)

# Binary Thermal Classification (Industry Research Based)
# Conditions for Hot Mix Asphalt (HMA): 
# Temp > 25C (Bitumen flow) AND Moisture < 8% (ASTM D2726 safety)
is_thermal_ok = ((ambient_temp >= 25) & (surface_moisture < 8.0)).astype(int)

# ----- Assemble Research Dataset -----
df = pd.DataFrame({
    'length': np.round(length, 3),
    'width': np.round(width, 3),
    'depth': np.round(depth, 4),
    'area': np.round(area, 4),
    'ambient_temp': np.round(ambient_temp, 1),
    'surface_moisture': np.round(surface_moisture, 1),
    'defect_severity': severity,
    'mass_required_kg': np.round(mass_required, 3),
    'is_thermal_ok': is_thermal_ok,
    'is_monsoon_sim': is_monsoon
})

# ----- Save Dataset -----
os.makedirs('dataset', exist_ok=True)
output_path = 'dataset/road_material_data.csv'
df.to_csv(output_path, index=False)

print(f"Research Dataset generated: {N} samples")
print(f"Saved to: {output_path}")
print("\nFeature Correlations with Mass:")
print(df.corr()['mass_required_kg'].sort_values(ascending=False))
print(f"\nThermal Safety Balance: {df['is_thermal_ok'].value_counts(normalize=True).to_dict()}")

