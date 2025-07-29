# utils.py
from yensiLogging.yensilog import setupLogging

logger = setupLogging()


def makeResponse(status: str, result=None):
    return {
        "status": status,
        "result": result,
    }
