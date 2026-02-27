# PowerShell script para Windows - Iniciar Desarrollo
# Uso: .\scripts\start-dev.ps1

Write-Host "🚀 Iniciando entorno de desarrollo..." -ForegroundColor Green

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado. Por favor instala Node.js desde nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar PostgreSQL
try {
    $pgVersion = psql --version | Out-String
    Write-Host "✅ PostgreSQL: $pgVersion.Trim()" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL no encontrado. Por favor instala PostgreSQL desde postgresql.org" -ForegroundColor Red
    exit 1
}

# Configurar base de datos si es necesario
Write-Host "🗄️ Verificando configuración de base de datos..." -ForegroundColor Yellow
& ".\scripts\setup-db.ps1"

# Iniciar backend
Write-Host "🔧 Iniciando backend..." -ForegroundColor Yellow
Set-Location backend
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Minimized
Set-Location ..

# Esperar a que backend inicie
Write-Host "⏳ Esperando a que backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Iniciar frontend
Write-Host "🎨 Iniciando frontend..." -ForegroundColor Yellow
Set-Location frontend
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Minimized
Set-Location ..

Write-Host "🎉 Entorno de desarrollo iniciado!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️ Base de datos: localhost:5432" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Para detener: Ctrl+C en cada terminal o cierra las ventanas" -ForegroundColor Yellow
