from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Query, Body, Request
from Models.models import TemperatureReading, getThresholdUpdate
from Utils.utils import makeResponse, logger
from Database.db import insertTemperature, getAllTemperatures, getLatestTemperature, getThreshold, updateThreshold, insertFeverAlert, getActiveAlert, resolveAlert, getFeverAlerts


router = APIRouter()


# POST /temperature
@router.post("/temperature")
def receiveTemperature(request: Request, reading: TemperatureReading):
    try:
        logger.debug(f"receiveTemperature: Received data -> {reading.model_dump()}")

        insertTemperature(reading.model_dump())
        logger.debug(f"Inserted temperature reading for deviceId: {reading.deviceId}")

        threshold_doc = getThreshold(reading.deviceId)
        threshold = threshold_doc["threshold"] if threshold_doc else 38.0
        logger.debug(f"Threshold for deviceId {reading.deviceId} is {threshold}")

        if reading.temperature >= threshold:
            logger.debug(f"Temperature {reading.temperature} exceeds threshold {threshold}")
            active_alert = getActiveAlert(reading.deviceId)
            if not active_alert:
                insertFeverAlert(reading.deviceId, reading.temperature, threshold)
                logger.info(f"Fever alert inserted for deviceId: {reading.deviceId}")
        else:
            alert = getActiveAlert(reading.deviceId)
            if alert:
                resolveAlert(alert["_id"])
                logger.info(f"Resolved alert for deviceId: {reading.deviceId}")

        logger.debug(f"Temperature processed successfully for deviceId: {reading.deviceId}")
        return makeResponse("success", {"deviceId": reading.deviceId, "temperature": reading.temperature, "timestamp": reading.timestamp, "unit": "celsius"})
    except Exception as e:
        logger.error(f"Error receiving temperature for deviceId: {reading.deviceId},error:{e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Server error while processing temperature")


@router.get("/temperature/latest")
def getLatest(request: Request, deviceId: str):
    try:
        logger.debug(f"getLatest: Fetching latest temperature for deviceId: {deviceId}")

        reading = getLatestTemperature(deviceId)
        if not reading:
            logger.info(f"No temperature reading found for deviceId: {deviceId}")
            return makeResponse("success", None)

        reading["id"] = str(reading.pop("_id"))
        logger.debug(f"Latest reading for deviceId {deviceId}: {reading}")

        return makeResponse("success", reading)
    except Exception as e:
        logger.error(f"Error retrieving latest temperature for deviceId: {deviceId},error:{e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch latest data")


@router.get("/temperature/history")
def getHistory(request: Request, deviceId: str, limit: int = Query(default=50)):
    try:
        logger.debug(f"getHistory: Fetching last {limit} readings for deviceId: {deviceId}")

        cursor = getAllTemperatures({"deviceId": deviceId}, sort=[("timestamp", -1)]).limit(limit)
        readings = [{"id": str(r.pop("_id")), **r} for r in cursor]

        logger.debug(f"Fetched {len(readings)} temperature readings for deviceId: {deviceId}")
        return makeResponse("success", readings)
    except Exception as e:
        logger.error(f"Error retrieving temperature history for deviceId: {deviceId},Error:{e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch history data")


@router.get("/temperature/status")
def getStatus(request: Request, deviceId: str):
    try:
        logger.debug(f"getStatus: Checking status for deviceId: {deviceId}")

        latest = getLatestTemperature(deviceId)
        if not latest:
            logger.info(f"No latest temperature found for deviceId: {deviceId}")
            return makeResponse("success", {"status": "unknown"})

        now = datetime.now(timezone.utc)
        ts = latest["timestamp"]
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        recent = ts >= now - timedelta(minutes=5)
        logger.debug(f"Timestamp is recent: {recent}")

        threshold_doc = getThreshold(deviceId)
        threshold = threshold_doc["threshold"] if threshold_doc else 38.0
        logger.debug(f"Threshold for deviceId {deviceId} is {threshold}")

        status = "fever" if latest["temperature"] >= threshold else "normal"
        final_status = status if recent else "unknown"

        result = {"deviceId": deviceId, "status": final_status, "currentTemperature": latest["temperature"], "threshold": threshold, "lastUpdated": latest["timestamp"]}

        logger.debug(f"Status result for deviceId {deviceId}: {result}")
        return makeResponse("success", result)
    except Exception as e:
        logger.error(f"Error determining temperature status for deviceId: {deviceId},Error:{e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get status")


@router.get("/temperature/threshold")
def getDeviceThreshold(request: Request, deviceId: str):
    try:
        logger.debug(f"getDevice_threshold: Fetching threshold for deviceId: {deviceId}")

        doc = getThreshold(deviceId)
        if not doc:
            logger.info(f"No threshold found for deviceId: {deviceId}, using default (38.0)")
            return makeResponse("success", {"deviceId": deviceId, "threshold": 38.0, "unit": "celsius", "updatedAt": None})

        doc["id"] = str(doc.pop("_id"))
        logger.debug(f"Threshold document for deviceId {deviceId}: {doc}")

        return makeResponse("success", doc)
    except Exception as e:
        logger.error(f"Error retrieving threshold for deviceId: {deviceId},Error:{e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch threshold")


@router.post("/temperature/threshold")
def updateDeviceThreshold(request: Request, data: getThresholdUpdate = Body(...)):
    try:
        logger.debug(f"updateDeviceThreshold: Received update request for deviceId: {data.deviceId} with threshold: {data.threshold}")

        updated = updateThreshold(data.deviceId, data.threshold)
        if not updated:
            logger.warning(f"Device not found while updating threshold for deviceId: {data.deviceId}")
            raise HTTPException(status_code=404, detail="Device not found")

        updated["id"] = str(updated.pop("_id"))
        logger.info(f"Threshold updated successfully for deviceId: {data.deviceId}")
        logger.debug(f"Updated document: {updated}")

        return makeResponse("success", updated)
    except Exception as e:
        logger.error(f"Error updating threshold for deviceId: {data.deviceId},Error:{e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update threshold")


@router.get("/temperature/alerts")
def getAlerts(request: Request, deviceId: str):
    try:
        logger.debug(f"getAlerts: Fetching fever alerts for deviceId: {deviceId}")

        alerts = getFeverAlerts(deviceId)
        formatted = [{"id": str(alert["_id"]), **{k: v for k, v in alert.items() if k != "_id"}} for alert in alerts]

        logger.debug(f"Fetched {len(formatted)} alert(s) for deviceId: {deviceId}")
        return makeResponse("success", formatted)
    except Exception:
        logger.error(f"Error fetching fever alerts for deviceId: {deviceId}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")
