from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import random
from datetime import datetime

app = FastAPI(title="Voltava AI Energy Brain Microservice")

# Data Models
class TelemetryData(BaseModel):
    deviceId: str
    voltage: float
    current: float
    soc: float
    soh: float
    temp: float
    cellVoltages: List[float]
    cellTemps: List[float]

class AIPrediction(BaseModel):
    rul: int
    failureProbability: float
    healthRank: int
    cellRunawayRisk: bool
    mosfetRisk: bool
    chargerOverheatingRisk: bool
    anomaliesDetected: List[str]

class AnomalyLog(BaseModel):
    time: str
    device: str
    type: str
    desc: str
    severity: str

# Global variable to store anomaly logs for the demo
anomaly_logs: List[AnomalyLog] = []

@app.post("/predict", response_model=AIPrediction)
async def predict_health(data: TelemetryData):
    # Dummy logic to replace simulator's static data with dynamic data for now
    # In a real app, this is where the PyTorch/TensorFlow model runs.
    
    # Simple rule-based mock for demonstration
    healthRank = int(data.soh) - (1 if data.temp > 40 else 0)
    failureProbability = 1.0 + (50.0 - data.voltage) * 0.5
    if failureProbability < 0:
        failureProbability = 0.5

    cellRunawayRisk = any(t > 45 for t in data.cellTemps)
    mosfetRisk = data.current < -30 and data.temp > 40
    
    anomalies = []
    if cellRunawayRisk:
        anomalies.append("High cell temperature detected")
        anomaly_logs.insert(0, AnomalyLog(
            time=datetime.now().isoformat(),
            device=data.deviceId,
            type="Thermal Anomaly",
            desc=f"Cell temperature exceeded 45°C. Max recorded: {max(data.cellTemps)}°C",
            severity="high"
        ))
    if mosfetRisk:
        anomalies.append("MOSFET high load and temp")
        anomaly_logs.insert(0, AnomalyLog(
            time=datetime.now().isoformat(),
            device=data.deviceId,
            type="MOSFET Warning",
            desc="MOSFET experiencing high continuous load at elevated temperatures.",
            severity="medium"
        ))
        
    # Limit logs to 50
    while len(anomaly_logs) > 50:
        anomaly_logs.pop()

    return AIPrediction(
        rul=int(data.soh * 15),
        failureProbability=min(failureProbability, 100.0),
        healthRank=max(0, min(healthRank, 100)),
        cellRunawayRisk=cellRunawayRisk,
        mosfetRisk=mosfetRisk,
        chargerOverheatingRisk=False,
        anomaliesDetected=anomalies
    )

@app.get("/anomalies", response_model=List[AnomalyLog])
async def get_anomalies():
    # If no real anomalies have been triggered, return some default mocked ones for the UI
    if not anomaly_logs:
        return [
            AnomalyLog(
                time=datetime.now().isoformat(),
                device="BMS-ER-NCR-03",
                type="Thermal Anomaly",
                desc="BMS Cell #7 temperature rose to 71°C while ambient was 38°C. Delta exceeds 3-sigma thresholds.",
                severity="high"
            ),
            AnomalyLog(
                time=datetime.now().isoformat(),
                device="BMS-ER-BIH-02",
                type="Impedance Shift",
                desc="Cell #4 internal resistance increased by 8.4% compared to pack baseline.",
                severity="medium"
            )
        ]
    return anomaly_logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
