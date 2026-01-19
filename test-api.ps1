# Wait for server to be ready
Start-Sleep -Seconds 2

Write-Host "=== Testing Root Endpoint ===" -ForegroundColor Cyan
try {
    $root = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
    Write-Host "Success: Root endpoint working - $root" -ForegroundColor Green
} catch {
    Write-Host "Failed: Root endpoint error" -ForegroundColor Red
}

Write-Host "`n=== Testing DB Connection ===" -ForegroundColor Cyan
try {
    $db = Invoke-RestMethod -Uri "http://localhost:5000/test-db" -Method Get -ErrorAction Stop
    Write-Host "Success: Database connected!" -ForegroundColor Green
    Write-Host ($db | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Failed: Database connection error" -ForegroundColor Red
}

Write-Host "`n=== Testing Notifications Endpoint ===" -ForegroundColor Cyan
try {
    $notifications = Invoke-RestMethod -Uri "http://localhost:5000/notifications" -Method Get -ErrorAction Stop
    Write-Host "Success: Notifications endpoint working!" -ForegroundColor Green
    Write-Host ($notifications | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Failed: Notifications endpoint error" -ForegroundColor Red
}

