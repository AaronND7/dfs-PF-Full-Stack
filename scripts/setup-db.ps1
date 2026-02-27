# PowerShell script para Windows - Configuración de Base de Datos
# Uso: .\scripts\setup-db.ps1

Write-Host "🗄️ Configurando Base de Datos PostgreSQL..." -ForegroundColor Green

# Verificar si PostgreSQL está instalado
try {
    $pgVersion = psql --version | Out-String
    Write-Host "✅ PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL no encontrado. Por favor instala PostgreSQL desde postgresql.org" -ForegroundColor Red
    exit 1
}

# Configuración de variables
$PGHOST = "localhost"
$PGPORT = "5432"
$PGUSER = "postgres"
$APP_USER = "app_user"
$APP_PASSWORD = "devpass"
$DB_NAME = "escuela_musica"

Write-Host "👤 Creando usuario '$APP_USER'..." -ForegroundColor Yellow

# Crear usuario de la aplicación
try {
    psql -h $PGHOST -p $PGPORT -U $PGUSER -d postgres -c "CREATE USER $APP_USER WITH PASSWORD '$APP_PASSWORD' CREATEDB;" -ErrorAction SilentlyContinue
    Write-Host "✅ Usuario '$APP_USER' creado" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Usuario '$APP_USER' ya existe" -ForegroundColor Yellow
}

# Crear base de datos
Write-Host "🗄️ Creando base de datos '$DB_NAME'..." -ForegroundColor Yellow

try {
    psql -h $PGHOST -p $PGPORT -U $PGUSER -d postgres -c "CREATE DATABASE $DB_NAME OWNER $APP_USER;" -ErrorAction SilentlyContinue
    Write-Host "✅ Base de datos '$DB_NAME' creada" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Base de datos '$DB_NAME' ya existe" -ForegroundColor Yellow
}

# Cargar esquema y datos iniciales
Write-Host "📋 Cargando esquema y datos iniciales..." -ForegroundColor Yellow

try {
    psql -h $PGHOST -p $PGPORT -U $APP_USER -d $DB_NAME -f "backend\db\setup.sql"
    Write-Host "✅ Esquema y datos cargados exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error cargando esquema. Verifica el archivo backend\db\setup.sql" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Base de datos configurada exitosamente!" -ForegroundColor Green
Write-Host "📝 Archivo .env configurado con:" -ForegroundColor Cyan
Write-Host "   DB_HOST=localhost" -ForegroundColor Cyan
Write-Host "   DB_PORT=5432" -ForegroundColor Cyan
Write-Host "   DB_NAME=$DB_NAME" -ForegroundColor Cyan
Write-Host "   DB_USER=$APP_USER" -ForegroundColor Cyan
Write-Host "   DB_PASSWORD=$APP_PASSWORD" -ForegroundColor Cyan
