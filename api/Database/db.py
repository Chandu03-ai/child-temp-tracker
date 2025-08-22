from pymongo import MongoClient, DESCENDING, ASCENDING
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from constants import mongoUrl, mongoDatabase, mongotemparatureCollection, mongoDeviceThresholdCollection, mongoAlertCollection

client = MongoClient(mongoUrl)
db = client[mongoDatabase]
readingsCollection = db[mongotemparatureCollection]
thresholdsCollection = db[mongoDeviceThresholdCollection]
alertsCollection = db[mongoAlertCollection]


# Temperature Readings
def insertTemperature(temperature: dict):
    readingsCollection.insert_one(temperature)


def getAllTemperatures(query: dict = None, sort: list = None):
    if query is None:
        query = {}
    cursor = readingsCollection.find(query)
    if sort:
        cursor = cursor.sort(sort)
    return cursor


def getLatestTemperature(deviceId: str):
    return readingsCollection.find_one({"deviceId": deviceId}, sort=[("timestamp", DESCENDING)])


# Thresholds
def insertThreshold(deviceId: str, threshold: float):
    doc = {"deviceId": deviceId, "threshold": threshold, "unit": "celsius", "updatedAt": datetime.now(timezone.utc)}
    thresholdsCollection.insert_one(doc)
    return doc


def getThreshold(deviceId: str):
    return thresholdsCollection.find_one({"deviceId": deviceId})


def updateThreshold(deviceId: str, threshold: float):
    updated = thresholdsCollection.find_one_and_update(
        {"deviceId": deviceId}, {"$set": {"threshold": threshold, "unit": "celsius", "updatedAt": datetime.now(timezone.utc)}}, upsert=True, return_document=True
    )
    return updated


# Alerts
def insertFeverAlert(deviceId: str, temperature: float, threshold: float):
    doc = {"deviceId": deviceId, "temperature": temperature, "threshold": threshold, "timestamp": datetime.now(timezone.utc), "resolved": False, "resolvedAt": None}
    alertsCollection.insert_one(doc)
    return doc


def getActiveAlert(deviceId: str):
    return alertsCollection.find_one({"deviceId": deviceId, "resolved": False})


def resolveAlert(alert_id: ObjectId):
    alertsCollection.update_one({"_id": alert_id}, {"$set": {"resolved": True, "resolvedAt": datetime.now(timezone.utc)}})


def getFeverAlerts(deviceId: str):
    return alertsCollection.find({"deviceId": deviceId}).sort("timestamp", DESCENDING)


# Data Retention Utilities (not auto-run; call with cron/job if needed)
def deleteOldReadings(days=30):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    readingsCollection.delete_many({"timestamp": {"$lt": cutoff}})


def deleteOldResolvedAlerts(days=7):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    alertsCollection.delete_many({"resolved": True, "resolvedAt": {"$lt": cutoff}})


# Index Setup (call once)
def setupIndexes():
    readingsCollection.create_index([("deviceId", ASCENDING)])
    readingsCollection.create_index([("timestamp", DESCENDING)])
    readingsCollection.create_index([("deviceId", ASCENDING), ("timestamp", DESCENDING)])
    alertsCollection.create_index([("deviceId", ASCENDING)])
    alertsCollection.create_index([("resolved", ASCENDING)])
    thresholdsCollection.create_index("deviceId")
