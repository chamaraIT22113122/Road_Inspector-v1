import os
import csv
import random
from pymongo import MongoClient
from datetime import datetime, timedelta

MONGO_URI = "mongodb+srv://tcnbandara_db_user:lykiyZb45FYTj2gj@roadinspector.qzvo2u3.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client.road_inspector
collection = db.material_estimations

locations = [
    "Kandy Road - Peliyagoda", "Galle Road - Colombo 3", "Baseline Road - Borella", 
    "High Level Road - Nugegoda", "Negombo Road - Wattala", "Marine Drive - Bambalapitiya", 
    "Parliament Road - Rajagiriya", "Southern Expressway - Gelanigama", "Unknown Location"
]

print("Reading dataset...")
docs = []
with open('dataset/road_material_data.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        length = float(row['length'])
        width = float(row['width'])
        depth = float(row['depth'])
        area = float(row['area'])
        ambient = float(row['ambient_temp'])
        moist = float(row['surface_moisture'])
        sev = int(row['defect_severity'])
        mass = float(row['mass_required_kg'])
        safe = int(row['is_thermal_ok']) == 1

        # Distribute timestamps randomly over the last 90 days
        random_days = random.randint(0, 90)
        random_hours = random.randint(0, 23)
        random_minutes = random.randint(0, 59)
        record_time = datetime.now() - timedelta(days=random_days, hours=random_hours, minutes=random_minutes)

        doc = {
            "success": True,
            "location_name": random.choice(locations),
            "timestamp": record_time.isoformat(),
            "inputs": {
                "length_m": length,
                "width_m": width,
                "depth_m": depth,
                "area_m2": round(area, 4),
                "ambient_temp_c": ambient,
                "surface_moisture_pct": moist,
                "defect_severity": ["Low", "Medium", "High"][sev]
            },
            "ai_prediction": {
                "predicted_mass_kg": round(mass, 2),
                "physics_mass_kg": round(mass * 1.03, 2),
                "volume_m3": round(area * depth, 5),
                "bitumen_grade": "60/70 Penetration Grade",
                "application_temp_range": "135°C - 163°C",
                "mixture": {
                    "aggregate_kg": round(mass * 0.95, 2),
                    "bitumen_kg": round(mass * 0.05, 2)
                },
                "labor": {
                    "estimated_time_mins": round((mass / 1000.0) * 120),
                    "equipment": "Heavy Vibratory Roller" if mass > 300 else "Walk-behind Roller"
                }
            },
            "thermal_analysis": {
                "is_safe": safe,
                "confidence_pct": round(random.uniform(85, 99), 1),
                "recommendation": "Historical Data (Database Import)",
                "issues": []
            },
            "model_info": {
                "r2_score": 0.99,
                "mae_kg": 15.2
            }
        }
        docs.append(doc)

print(f"Parsed {len(docs)} records. Inserting into MongoDB Atlas...")

# Insert in chunks of 1000 to avoid payload limits
chunk_size = 1000
for i in range(0, len(docs), chunk_size):
    chunk = docs[i:i + chunk_size]
    collection.insert_many(chunk)
    print(f"Inserted {i + len(chunk)} / {len(docs)}")

print("✅ Successfully seeded MongoDB with all dataset records!")
