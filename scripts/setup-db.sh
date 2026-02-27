#!/bin/bash
# Script universal para macOS/Linux - Configuración de Base de Datos
# Uso: ./scripts/setup-db.sh

echo "🗄️ Configurando Base de Datos PostgreSQL..."

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no encontrado."
    echo "📥 Por favor instala PostgreSQL:"
    echo "   macOS: brew install postgresql@16"
    echo "   Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "   CentOS: sudo yum install postgresql-server"
    exit 1
fi

echo "✅ PostgreSQL encontrado: $(psql --version)"

# Configuración de variables
export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-postgres}"
APP_USER="app_user"
APP_PASSWORD="devpass"
DB_NAME="escuela_musica"

echo "👤 Creando usuario '$APP_USER'..."

# Crear usuario de la aplicación
if psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c "CREATE USER $APP_USER WITH PASSWORD '$APP_PASSWORD' CREATEDB;" 2>/dev/null; then
    echo "✅ Usuario '$APP_USER' creado"
else
    echo "ℹ️ Usuario '$APP_USER' ya existe"
fi

# Crear base de datos
echo "🗄️ Creando base de datos '$DB_NAME'..."

if psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -c "CREATE DATABASE $DB_NAME OWNER $APP_USER;" 2>/dev/null; then
    echo "✅ Base de datos '$DB_NAME' creada"
else
    echo "ℹ️ Base de datos '$DB_NAME' ya existe"
fi

# Cargar esquema y datos iniciales
echo "📋 Cargando esquema y datos iniciales..."

if psql -h "$PGHOST" -p "$PGPORT" -U "$APP_USER" -d "$DB_NAME" -f "backend/db/setup.sql"; then
    echo "✅ Esquema y datos cargados exitosamente"
else
    echo "❌ Error cargando esquema. Verifica el archivo backend/db/setup.sql"
    exit 1
fi

echo "🎉 Base de datos configurada exitosamente!"
echo "📝 Archivo .env configurado con:"
echo "   DB_HOST=$PGHOST"
echo "   DB_PORT=$PGPORT"
echo "   DB_NAME=$DB_NAME"
echo "   DB_USER=$APP_USER"
echo "   DB_PASSWORD=$APP_PASSWORD"
