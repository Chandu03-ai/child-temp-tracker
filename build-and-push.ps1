# Exit on any error
$ErrorActionPreference = "Stop"

$registry = "192.168.0.189:5000"

# === Build API ===
docker build -t ${registry}/temp_api:latest .\api
docker push ${registry}/temp_api:latest


docker build -t ${registry}/temp_ui:latest .\ui
docker push ${registry}/temp_ui:latest

Write-Host "✅ All images built and pushed successfully!" -ForegroundColor Green
