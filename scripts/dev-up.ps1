if (!(Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Output "Created .env from .env.example"
}

docker compose up --build
