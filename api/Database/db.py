from pymongo import MongoClient, DESCENDING, ASCENDING
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]

readingsCol = db["temperatureReadings"]
thresholdsCol = db["deviceThresholds"]
alertsCol = db["feverAlerts"]


# Temperature Readings
def insertTemperature(temperature: dict):
    readingsCol.insert_one(temperature)


def getAllTemperatures(query: dict = None, sort: list = None):
    if query is None:
        query = {}
    cursor = readingsCol.find(query)
    if sort:
        cursor = cursor.sort(sort)
    return cursor


def getLatestTemperature(deviceId: str):
    return readingsCol.find_one({"deviceId": deviceId}, sort=[("timestamp", DESCENDING)])


# Thresholds
def insertThreshold(deviceId: str, threshold: float):
    doc = {"deviceId": deviceId, "threshold": threshold, "unit": "celsius", "updatedAt": datetime.now(timezone.utc)}
    thresholdsCol.insert_one(doc)
    return doc


def getThreshold(deviceId: str):
    return thresholdsCol.find_one({"deviceId": deviceId})


def updateThreshold(deviceId: str, threshold: float):
    updated = thresholdsCol.find_one_and_update(
        {"deviceId": deviceId}, {"$set": {"threshold": threshold, "unit": "celsius", "updatedAt": datetime.now(timezone.utc)}}, upsert=True, return_document=True
    )
    return updated


# Alerts
def insertFeverAlert(deviceId: str, temperature: float, threshold: float):
    doc = {"deviceId": deviceId, "temperature": temperature, "threshold": threshold, "timestamp": datetime.now(timezone.utc), "resolved": False, "resolvedAt": None}
    alertsCol.insert_one(doc)
    return doc


def getActiveAlert(deviceId: str):
    return alertsCol.find_one({"deviceId": deviceId, "resolved": False})


def resolveAlert(alert_id: ObjectId):
    alertsCol.update_one({"_id": alert_id}, {"$set": {"resolved": True, "resolvedAt": datetime.now(timezone.utc)}})


def getFeverAlerts(deviceId: str):
    return alertsCol.find({"deviceId": deviceId}).sort("timestamp", DESCENDING)


# Data Retention Utilities (not auto-run; call with cron/job if needed)
def deleteOldReadings(days=30):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    readingsCol.delete_many({"timestamp": {"$lt": cutoff}})


def deleteOldResolvedAlerts(days=7):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    alertsCol.delete_many({"resolved": True, "resolvedAt": {"$lt": cutoff}})


# Index Setup (call once)
def setupIndexes():
    readingsCol.create_index([("deviceId", ASCENDING)])
    readingsCol.create_index([("timestamp", DESCENDING)])
    readingsCol.create_index([("deviceId", ASCENDING), ("timestamp", DESCENDING)])
    alertsCol.create_index([("deviceId", ASCENDING)])
    alertsCol.create_index([("resolved", ASCENDING)])
    thresholdsCol.create_index("deviceId")
