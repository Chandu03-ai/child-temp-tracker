from fastapi import FastAPI
from Router import tempRouter
from fastapi.middleware.cors import CORSMiddleware
from Utils.utils import make_response
import logging
import uvicorn

app = FastAPI()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def welcome():
    return make_response("success", "Welcome to Temperature API")


app.include_router(tempRouter.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 


