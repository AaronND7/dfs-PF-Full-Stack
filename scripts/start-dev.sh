#!/bin/bash
# Script universal para macOS/Linux - Iniciar Desarrollo
# Uso: ./scripts/start-dev.sh

echo "🚀 Iniciando entorno de desarrollo..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Por favor instala Node.js desde nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no encontrado. Por favor instala PostgreSQL"
    echo "   macOS: brew install postgresql@16"
    echo "   Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo "✅ PostgreSQL: $(psql --version)"

# Configurar base de datos si es necesario
echo "🗄️ Verificando configuración de base de datos..."
./scripts/setup-db.sh

# Iniciar backend y frontend concurrentemente
echo "🔧 Iniciando backend..."
echo "🎨 Iniciando frontend..."

# Usar concurrently si está disponible, sino iniciar en background
if command -v concurrently &> /dev/null; then
    concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
else
    # Iniciar backend en background
    cd backend && npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Esperar a que backend inicie
    echo "⏳ Esperando a que backend inicie..."
    sleep 3
    
    # Iniciar frontend
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo "🎉 Entorno de desarrollo iniciado!"
    echo "📱 Frontend: http://localhost:5173"
    echo "🔧 Backend:  http://localhost:3000"
    echo "🗄️ Base de datos: localhost:5432"
    echo ""
    echo "Para detener: Ctrl+C o kill $BACKEND_PID $FRONTEND_PID"
    
    # Esperar señales
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
    wait
fi
