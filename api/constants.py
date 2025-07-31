import os

# =========================
#  Keycloak Configuration
# =========================
keycloakUrl = os.getenv("KEYCLOAK_URL", "http://localhost:8080/auth")
keycloakAdmin = os.getenv("KEYCLOAK_ADMIN", "keycloakadmin")
keycloakAdminSecretKey = os.getenv("KEYCLOAK_ADMIN_SECRET_KEY", "keycloakadmin")
keycloakRealm = os.getenv("KEYCLOAK_REALM", "sso-realm")
keycloakClientId = os.getenv("KEYCLOAK_CLIENT_ID", "sso-client")
keycloakClientSecret = os.getenv("KEYCLOAK_CLIENT_SECRET_KEY", "RJfiAZfdwRAQB02XtAJoV4E186zMCULG")
keycloakBaseUrl = os.getenv("KEYCLOAK_BASE_URL", "http://localhost:8080")
keycloakRedirectUri = os.getenv("KEYCLOAK_REDIRECT_URI", "http://localhost:8000/auth/callback")
tokenUrl = os.getenv("TOKEN_URL", f"{keycloakBaseUrl}/realms/{keycloakRealm}/protocol/openid-connect/token")
authUrl = os.getenv("AUTH_URL", f"{keycloakBaseUrl}/realms/{keycloakRealm}/protocol/openid-connect/auth")

# ======================
#  MongoDB Configuration
# ======================
mongoUrl = os.getenv("MONGO_DB_URL", "mongodb://localhost:27017/")
mongoDatabase = os.getenv("MONGO_DATABASE_NAME", "temperatureDb")
mongoUserCollection = os.getenv("MONGO_USER_COLLECTION_NAME", "users")
mongoResetPasswordCollection = os.getenv("MONGO_RESET_PASSWORD_COLLECTION_NAME", "passwordReset")
mongotemparatureCollection = os.getenv("MONGO_TEMPERATURE_COLLECTION_NAME", "temperatureReadings")
mongoDeviceThresholdCollection = os.getenv("THRESHOLDS_COLLECTION", "deviceThresholds")
mongoAlertCollection = os.getenv("ALERTS_COLLECTION", "feverAlerts")
