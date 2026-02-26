$ImageName = "health-backend:standalone"
$ContainerName = "health-backend"
$Port = 8080
$VolumeName = "health_backend_data"

$JwtSecret = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "change_this_secret_now" }
$AdminEmail = if ($env:ADMIN_EMAIL) { $env:ADMIN_EMAIL } else { "admin@example.com" }
$AdminPassword = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { "change_me_please" }

Write-Output "[1/4] Building standalone image..."
docker build -f Dockerfile.standalone -t $ImageName .

Write-Output "[2/4] Recreating container..."
docker rm -f $ContainerName | Out-Null

Write-Output "[3/4] Starting container..."
docker run -d --name $ContainerName -p "${Port}:8080" `
  -v "${VolumeName}:/app" `
  -e JWT_SECRET=$JwtSecret `
  -e ADMIN_EMAIL=$AdminEmail `
  -e ADMIN_PASSWORD=$AdminPassword `
  $ImageName | Out-Null

Write-Output "[4/4] Waiting until service is healthy..."
for ($i = 0; $i -lt 60; $i++) {
  $status = docker inspect --format='{{json .State.Health.Status}}' $ContainerName 2>$null
  if ($status -eq '"healthy"') {
    Write-Output "✅ Ready: http://localhost:$Port"
    Write-Output "✅ API docs: http://localhost:$Port/api/docs"
    exit 0
  }
  Start-Sleep -Seconds 1
}

Write-Output "❌ Container did not become healthy in time."
docker logs $ContainerName --tail 200
exit 1
