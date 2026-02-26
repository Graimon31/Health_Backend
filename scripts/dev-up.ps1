# PowerShell Script for One-Click Launch

# Change to project root if running from scripts/
if (Test-Path "../docker-compose.yml") {
    Set-Location ..
}

Write-Host "🚀 Starting Health Service One-Click Setup..." -ForegroundColor Cyan

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Error: Docker is not installed. Please install Docker Desktop first."
    exit 1
}

# Create .env if missing
if (!(Test-Path ".env")) {
    Write-Host "📄 Creating .env file from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Build and Start
Write-Host "🐳 Building and starting containers..." -ForegroundColor Cyan
docker compose up --build -d

Write-Host "⏳ Waiting for services (this might take a minute)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🎉 All systems GO!" -ForegroundColor Green
Write-Host "---------------------------------------------------"
Write-Host "🌐 Frontend Panel:  http://localhost:8080"
Write-Host "📚 API Docs:        http://localhost:8080/api/docs"
Write-Host "---------------------------------------------------"
Write-Host "To stop: docker compose down"
