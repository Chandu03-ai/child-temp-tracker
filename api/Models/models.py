from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TemperatureReading(BaseModel):
    deviceId: str
    temperature: float
    timestamp: Optional[str] 

    def to_fahrenheit(self):
        return round((self.temperature * 9 / 5) + 32, 2)


class getThresholdUpdate(BaseModel):
    deviceId: str
    threshold: float
