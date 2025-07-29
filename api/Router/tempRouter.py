import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Query, Body
from Models.models import TemperatureReading, getThresholdUpdate
from Utils.utils import make_response
from Database.db import (
    insertTemperature, getAllTemperatures, getLatestTemperature,
    getThreshold, updateThreshold,
    insertFeverAlert, getActiveAlert, resolveAlert,
    getFeverAlerts
)

router = APIRouter()

# POST /temperature
@router.post("/temperature")
def receive_temperature(reading: TemperatureReading):
    try:
        insertTemperature(reading.model_dump())

        threshold_doc = getThreshold(reading.deviceId)
        threshold = threshold_doc['threshold'] if threshold_doc else 38.0

        if reading.temperature >= threshold:
            active_alert = getActiveAlert(reading.deviceId)
            if not active_alert:
                insertFeverAlert(reading.deviceId, reading.temperature, threshold)
        else:
            alert = getActiveAlert(reading.deviceId)
            if alert:
                resolveAlert(alert['_id'])

        return make_response("success", {
            "deviceId": reading.deviceId,
            "temperature": reading.temperature,
            "timestamp": reading.timestamp,
            "unit": "celsius"
        })
    except Exception:
        logging.exception("Error receiving temperature")
        raise HTTPException(status_code=500, detail="Server error while processing temperature")

@router.get("/temperature/latest")
def get_latest(deviceId: str):
    try:
        reading = getLatestTemperature(deviceId)
        if not reading:
            return make_response("success", None)

        reading["id"] = str(reading.pop("_id"))
        return make_response("success", reading)
    except Exception:
        logging.exception("Error retrieving latest temperature")
        raise HTTPException(status_code=500, detail="Failed to fetch latest data")

@router.get("/temperature/history")
def get_history(deviceId: str, limit: int = Query(default=50)):
    try:
        cursor = getAllTemperatures({"deviceId": deviceId}, sort=[("timestamp", -1)]).limit(limit)
        readings = [{"id": str(r.pop("_id")), **r} for r in cursor]
        return make_response("success", readings)
    except Exception:
        logging.exception("Error retrieving temperature history")
        raise HTTPException(status_code=500, detail="Failed to fetch history data")

@router.get("/temperature/status")
def get_status(deviceId: str):
    try:
        latest = getLatestTemperature(deviceId)
        if not latest:
            return make_response("success", {"status": "unknown"})

        now = datetime.now(timezone.utc)
        ts = latest['timestamp']
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        recent = ts >= now - timedelta(minutes=5)

        threshold_doc = getThreshold(deviceId)
        threshold = threshold_doc['threshold'] if threshold_doc else 38.0
        status = "fever" if latest['temperature'] >= threshold else "normal"

        result = {
            "deviceId": deviceId,
            "status": status if recent else "unknown",
            "currentTemperature": latest['temperature'],
            "threshold": threshold,
            "lastUpdated": latest['timestamp']
        }
        return make_response("success", result)
    except Exception:
        logging.exception("Error determining temperature status")
        raise HTTPException(status_code=500, detail="Failed to get status")

@router.get("/temperature/threshold")
def get_device_threshold(deviceId: str):
    try:
        doc = getThreshold(deviceId)
        if not doc:
            return make_response("success", {"deviceId": deviceId, "threshold": 38.0, "unit": "celsius", "updatedAt": None})
        doc["id"] = str(doc.pop("_id"))
        return make_response("success", doc)
    except Exception:
        logging.exception("Error retrieving threshold")
        raise HTTPException(status_code=500, detail="Failed to fetch threshold")

@router.post("/temperature/threshold")
def update_device_threshold(data: getThresholdUpdate = Body(...)):
    try:
        updated = updateThreshold(data.deviceId, data.threshold)
        if not updated:
            raise HTTPException(status_code=404, detail="Device not found")
        updated["id"] = str(updated.pop("_id"))
        return make_response("success", updated)
    except Exception:
        logging.exception("Error updating threshold")
        raise HTTPException(status_code=500, detail="Failed to update threshold")

@router.get("/temperature/alerts")
def get_alerts(deviceId: str):
    try:
        alerts = getFeverAlerts(deviceId)
        formatted = [
            {
                "id": str(alert["_id"]),
                **{k: v for k, v in alert.items() if k != "_id"}
            }
            for alert in alerts
        ]
        return make_response("success", formatted)
    except Exception:
        logging.exception("Error fetching fever alerts")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")