import requests
import json
import random
import time

def collect_sensor_data():
    # Simulate collecting data from sensors
    data = {
        "engine_temperature": random.uniform(70, 90),  # in Celsius
        "oil_pressure": random.uniform(20, 40),       # in PSI
        "tire_pressure": {
            "front_left": random.uniform(30, 35),     # in PSI
            "front_right": random.uniform(30, 35),    # in PSI
            "rear_left": random.uniform(30, 35),      # in PSI
            "rear_right": random.uniform(30, 35)      # in PSI
        },
        "battery_status": random.choice(["Good", "Low", "Critical"]),
        "fuel_level": random.uniform(10, 100),        # in percentage
        "gps_location": {
            "latitude": random.uniform(-90, 90),
            "longitude": random.uniform(-180, 180)
        }
    }
    return data

url = 'http://localhost:3000/addRecord'
headers = {'Content-Type': 'application/json'}

while True:
    vehicleID = "vehicle1"
    data = collect_sensor_data()
    payload = {
        "vehicleID": vehicleID,
        "data": data
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code == 200:
        print('Record added successfully')
    else:
        print(f'Failed to add record: {response.text}')
    
    # Sleep for a specified interval before sending the next data point
    time.sleep(60)  # every 60 seconds

