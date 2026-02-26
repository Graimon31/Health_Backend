docker build -f Dockerfile.standalone -t health-backend:standalone .
docker rm -f health-backend | Out-Null

docker run -d --name health-backend -p 8080:8080 `
  -e JWT_SECRET=${env:JWT_SECRET} `
  -e ADMIN_EMAIL=${env:ADMIN_EMAIL} `
  -e ADMIN_PASSWORD=${env:ADMIN_PASSWORD} `
  health-backend:standalone

Write-Output "Container started: http://localhost:8080"
