# utils.py
def make_response(status: str, result=None):
    return {
        "status": status,
        "result": result,
    }
