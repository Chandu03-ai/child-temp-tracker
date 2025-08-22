from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "TemperatureDB")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME", "temperature")
    TEMPERATURE_THRESHOLD = float(os.getenv("TEMPERATURE_THRESHOLD", 38.0))

settings = Settings()