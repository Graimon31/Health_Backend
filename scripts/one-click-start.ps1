$ImageName = "health-backend:standalone"
$ContainerName = "health-backend"
$Port = if ($env:HOST_PORT) { $env:HOST_PORT } else { 8080 }
$VolumeName = "health_backend_data"

$JwtSecret = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "change_this_secret_now" }
$AdminEmail = if ($env:ADMIN_EMAIL) { $env:ADMIN_EMAIL } else { "admin@example.com" }
$AdminPassword = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { "change_me_please" }
$AdminFullName = if ($env:ADMIN_FULL_NAME) { $env:ADMIN_FULL_NAME } else { "System Admin" }

Write-Output "[0/5] Cleaning old containers from previous runs..."
docker rm -f $ContainerName health_nginx health_web health_api health_db | Out-Null

Write-Output "[1/5] Building standalone image (fresh build, no cache)..."
docker build --pull --no-cache -f Dockerfile.standalone -t $ImageName .

Write-Output "[2/5] Starting container on http://localhost:$Port ..."
docker run -d --name $ContainerName -p "${Port}:8080" `
  -v "${VolumeName}:/app/data" `
  -e JWT_SECRET=$JwtSecret `
  -e ADMIN_EMAIL=$AdminEmail `
  -e ADMIN_PASSWORD=$AdminPassword `
  -e ADMIN_FULL_NAME=$AdminFullName `
  $ImageName | Out-Null

Write-Output "[3/5] Waiting until service is healthy..."
$healthy = $false
for ($i = 0; $i -lt 90; $i++) {
  $status = docker inspect --format='{{json .State.Health.Status}}' $ContainerName 2>$null
  if ($status -eq '"healthy"') {
    $healthy = $true
    break
  }
  Start-Sleep -Seconds 1
}

if (-not $healthy) {
  Write-Output "❌ Container did not become healthy in time."
  docker logs $ContainerName --tail 200
  exit 1
}

Write-Output "[4/5] Verifying that the new dashboard UI is inside container..."
$check = docker exec $ContainerName sh -c "grep -q 'Search patients' /app/static/index.html; echo $?"
if ($check -eq '0') {
  Write-Output "✅ New dashboard build detected."
} else {
  Write-Output "⚠️ Warning: dashboard marker not found in /app/static/index.html"
}

Write-Output "[5/5] Done"
Write-Output "✅ Open: http://localhost:$Port"
Write-Output "✅ API docs: http://localhost:$Port/api/docs"
