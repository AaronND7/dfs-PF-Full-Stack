@echo off
title Servidor Estable - Backend
echo ========================================
echo  INICIANDO SERVIDOR ESTABLE
echo ========================================
echo.
echo Este servidor no se reiniciara automaticamente
echo Puerto: 4000
echo.
cd /d "%~dp0"
echo Iniciando servidor...
node server-estable.js
echo.
echo Servidor detenido. Presiona cualquier tecla para salir...
pause > nul
