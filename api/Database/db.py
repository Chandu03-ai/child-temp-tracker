from pymongo import MongoClient, DESCENDING, ASCENDING
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]

readings_col = db["temperature_readings"]
thresholds_col = db["device_thresholds"]
alerts_col = db["fever_alerts"]

# Temperature Readings
def insertTemperature(temperature: dict):
    readings_col.insert_one(temperature)

def getAllTemperatures(query: dict = None, sort: list = None):
    if query is None:
        query = {}
    cursor = readings_col.find(query)
    if sort:
        cursor = cursor.sort(sort)
    return cursor

def getLatestTemperature(deviceId: str):
    return readings_col.find_one(
        {"deviceId": deviceId},
        sort=[("timestamp", DESCENDING)]
    )

# Thresholds
def insertThreshold(deviceId: str, threshold: float):
    doc = {
        "deviceId": deviceId,
        "threshold": threshold,
        "unit": "celsius",
        "updatedAt": datetime.now(timezone.utc)
    }
    thresholds_col.insert_one(doc)
    return doc

def getThreshold(deviceId: str):
    return thresholds_col.find_one({"deviceId": deviceId})

def updateThreshold(deviceId: str, threshold: float):
    updated = thresholds_col.find_one_and_update(
        {"deviceId": deviceId},
        {"$set": {
            "threshold": threshold,
            "unit": "celsius",
            "updatedAt": datetime.now(timezone.utc)
        }},
        upsert=True,
        return_document=True
    )
    return updated

# Alerts
def insertFeverAlert(deviceId: str, temperature: float, threshold: float):
    doc = {
        "deviceId": deviceId,
        "temperature": temperature,
        "threshold": threshold,
        "timestamp": datetime.now(timezone.utc),
        "resolved": False,
        "resolvedAt": None
    }
    alerts_col.insert_one(doc)
    return doc

def getActiveAlert(deviceId: str):
    return alerts_col.find_one({"deviceId": deviceId, "resolved": False})

def resolveAlert(alert_id: ObjectId):
    alerts_col.update_one(
        {"_id": alert_id},
        {"$set": {"resolved": True, "resolvedAt": datetime.now(timezone.utc)}}
    )

def getFeverAlerts(deviceId: str):
    return alerts_col.find({"deviceId": deviceId}).sort("timestamp", DESCENDING)

# Data Retention Utilities (not auto-run; call with cron/job if needed)
def deleteOldReadings(days=30):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    readings_col.delete_many({"timestamp": {"$lt": cutoff}})

def deleteOldResolvedAlerts(days=7):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    alerts_col.delete_many({"resolved": True, "resolvedAt": {"$lt": cutoff}})

# Index Setup (call once)
def setupIndexes():
    readings_col.create_index([("deviceId", ASCENDING)])
    readings_col.create_index([("timestamp", DESCENDING)])
    readings_col.create_index([("deviceId", ASCENDING), ("timestamp", DESCENDING)])
    alerts_col.create_index([("deviceId", ASCENDING)])
    alerts_col.create_index([("resolved", ASCENDING)])
    thresholds_col.create_index("deviceId")
