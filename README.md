# Sistema de Gestión - Escuela de Música AARDEM

Bienvenido al repositorio oficial del proyecto **AARDEM**, una solución integral para la gestión de horarios, alumnos y clases, construida con tecnologías modernas de desarrollo web.

---

## Tecnologías Utilizadas

### **Frontend**

* **Vue.js 3 (Composition API):** Para una interfaz reactiva y moderna.
* **Vite:** Bundler de última generación para un desarrollo ultra rápido.
* **CSS Moderno:** Diseño modular y componentes escalables.

### **Backend**

* **Node.js & Express.js:** Servidor robusto para el manejo de la API REST.
* **CORS:** Configurado para comunicación segura entre dominios.
* **PostgreSQL:** Base de datos relacional para la persistencia de datos complejos.

---

## Arquitectura del Sistema

### Frontend (Interfaz de Usuario)

Se implementó una estructura de componentes modulares donde destaca `Calendar.vue`. Este componente gestiona la lógica de la agenda semanal.

* **Funcionalidad:** Visualización de horarios (08:00 a 21:00), asignación de clases mediante interacción directa y paneles laterales para gestión de catálogo.
* **Estado:** Reactividad optimizada con la sintaxis `<script setup>`.

### Backend (Servidor API)

El corazón del sistema corre sobre **Express**, gestionando las rutas y la lógica de negocio.

* **Endpoints:** Rutas preparadas para el manejo de usuarios, profesores, alumnos y horarios.
* **Seguridad:** Implementación de middlewares para validación y control de acceso.

### Base de Datos (PostgreSQL)

Diseño de base de datos relacional llamada `escuela_alumnos` que incluye:

* **Gestión de Roles:** Diferenciación entre Admin, Profesores y Alumnos.
* **Control de Solapamientos:** Restricciones lógicas para evitar que un profesor o aula tenga dos clases al mismo tiempo.
* **Esquema:** Tablas de login, correos electrónicos, cursos y descripciones detalladas.

---

## 1. Requisitos Previos

### **Opción A: Con Nix (Recomendado para desarrollo)**
* **Nix** con flakes habilitados.
* **Git**.

### **Opción B: Sin Nix (Compatible con Windows, macOS, Linux)**
* **Node.js 18+** - [nodejs.org](https://nodejs.org)
* **PostgreSQL 16+** - [postgresql.org](https://postgresql.org/download/)
* **Git**

*Nota: Nix provee Node.js y Postgres automáticamente. Si no usas Nix, deberás instalarlos manualmente.*

---

## Inicio Rápido (Recomendado)

### 1. Clonar el repositorio
```bash
git clone https://github.com/AaronND7/dfs-PF-Full-Stack.git
cd dfs-PF-Full-Stack
```

### 2. Iniciar Backend
```bash
cd backend
npm install
node src/server-weather-fixed.js
```

### 3. Iniciar Frontend (en otra terminal)
```bash
cd frontend
npm install
npm run dev
```

### 4. Acceder a la aplicación
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 2. Instalación y Configuración

### Clonar el repositorio

```bash
git clone https://github.com/AaronND7/dfs-PF-Full-Stack.git
cd dfs-PF-Full-Stack
```

### **Opción A: Con Nix**

```bash
nix develop --extra-experimental-features nix-command --extra-experimental-features flakes
```

### **Opción B: Sin Nix (Windows, macOS, Linux)**

#### **Windows (PowerShell):**
```powershell
# Configurar base de datos
.\scripts\setup-db.ps1

# Iniciar desarrollo
.\scripts\start-dev.ps1
```

#### **macOS/Linux (Terminal):**
```bash
# Hacer scripts ejecutables (solo Linux/macOS)
chmod +x scripts/*.sh

# Configurar base de datos
./scripts/setup-db.sh

# Iniciar desarrollo
./scripts/start-dev.sh
```

#### **Manual (todas las plataformas):**
```bash
# Backend
cd backend
npm install
node src/server-weather-fixed.js

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

---

## 3. Configuración de Base de Datos

### **Con Scripts Automatizados (Recomendado)**

Los scripts crean automáticamente:
- Usuario `app_user` con contraseña `devpass`
- Base de datos `escuela_musica`
- Esquema y datos iniciales

#### **Windows:**
```powershell
.\scripts\setup-db.ps1
```

#### **macOS/Linux:**
```bash
./scripts/setup-db.sh
```

### **Manual (si scripts fallan)**

1. **Crear usuario y base de datos manualmente:**
```sql
-- Conectarse a PostgreSQL como postgres
CREATE USER app_user WITH PASSWORD 'devpass' CREATEDB;
CREATE DATABASE escuela_musica OWNER app_user;
```

2. **Cargar esquema:**
```bash
psql -h localhost -U app_user -d escuela_musica -f backend/db/setup.sql
```

---

## 4. Acceso a la Aplicación

### **URLs de Acceso:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Base de Datos:** localhost:5432

### **Verificación:**
```bash
# Verificar API
curl http://localhost:3000
# Debería mostrar: {"status":"API running"}
```

---

## 5. Compatibilidad Multiplataforma

### **Windows:**
- PowerShell scripts (`.ps1`)
- npm/node.js nativo
- PostgreSQL para Windows

### **macOS:**
- Bash scripts (`.sh`)
- Homebrew soporte
- PostgreSQL nativo

### **Linux:**
- Bash scripts (`.sh`)
- npm/node.js nativo
- PostgreSQL (apt/yum)

### **Características Universales:**
- Mismas funcionalidades en todas las plataformas
- Mismas dependencias npm
- Misma estructura de base de datos
- Scripts automatizados según plataforma

---

## Galería del Proyecto

Aquí se muestran las capturas de pantalla de los diferentes módulos del sistema:

| Interfaz de Calendario | Respuesta del API |
| --- | --- |
|![](images/2026-02-03-235706.png) | ![](images/2026-02-04-000515.png) |


# Documentacion de la API
**Base URL (dev)**

```
http://localhost:3000
```

**Formato:** JSON
**Charset:** UTF-8

--

# Convenciones globales

## Headers requeridos

Para `POST` y `PATCH`:

```
Content-Type: application/json
```

---

## Estructura de error estándar

```json
{
  "error": "Mensaje descriptivo del problema"
}
```

---

## Códigos de estado

| Código | Uso                                         |
| ------ | ------------------------------------------- |
| 200    | Éxito                                       |
| 201    | Recurso creado                              |
| 204    | Eliminado sin contenido                     |
| 400    | Validación fallida                          |
| 404    | Recurso no encontrado                       |
| 409    | Conflicto de datos (reglas de negocio / DB) |
| 500    | Error interno                               |

---

# USUARIOS

Tabla: `usuarios`

| Campo    | Tipo         | Restricciones             |
| -------- | ------------ | ------------------------- |
| id       | SERIAL       | PK                        |
| nombre   | VARCHAR(100) | NOT NULL                  |
| email    | VARCHAR(100) | UNIQUE                    |
| password | VARCHAR(200) | NOT NULL                  |
| rol      | VARCHAR(20)  | admin / profesor / alumno |

---

### GET `/usuarios`

**Descripción:** Lista usuarios sin password.

**Response 200**

```json
[
  {
    "id": 1,
    "nombre": "Admin",
    "email": "admin@escuela.com",
    "rol": "admin"
  }
]
```

---

### GET `/usuarios/:id`

**Response 200**

```json
{
  "id": 1,
  "nombre": "Admin",
  "email": "admin@escuela.com",
  "rol": "admin"
}
```

**404** si no existe.

---

### POST `/usuarios`

**Body**

```json
{
  "nombre": "Juan",
  "email": "juan@mail.com",
  "password": "1234",
  "rol": "alumno"
}
```

**Validaciones**

| Regla           | Error |
| --------------- | ----- |
| rol inválido    | 400   |
| email duplicado | 409   |

**201**

---

### PATCH `/usuarios/:id`

Actualiza parcialmente.

---

### DELETE `/usuarios/:id`

Elimina usuario.

---

# PROFESORES

Tabla: `profesores`

| Campo        | Tipo         |
| ------------ | ------------ |
| id           | SERIAL       |
| nombre       | VARCHAR(100) |
| especialidad | VARCHAR(100) |

CRUD estándar.

---

# ALUMNOS

| Campo  | Tipo         |
| ------ | ------------ |
| id     | SERIAL       |
| nombre | VARCHAR(100) |
| edad   | INT (>0)     |

Validación edad > 0.

---

# CLASES

| Campo       | Tipo         |
| ----------- | ------------ |
| id          | SERIAL       |
| nombre      | VARCHAR(100) |
| descripcion | TEXT         |

---

# HORARIOS

Entidad crítica.

| Campo       | Tipo    | FK            |
| ----------- | ------- | ------------- |
| clase_id    | INT     | clases.id     |
| profesor_id | INT     | profesores.id |
| alumno_id   | INT     | alumnos.id    |
| dia_semana  | VARCHAR |               |
| hora_inicio | TIME    |               |
| hora_fin    | TIME    |               |

---

### GET `/horarios`

**200**

```json
[
  {
    "id": 1,
    "clase_id": 1,
    "profesor_id": 1,
    "alumno_id": 1,
    "dia_semana": "Lunes",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00"
  }
]
```

---

### POST `/horarios`

**Body**

```json
{
  "clase_id": 1,
  "profesor_id": 1,
  "alumno_id": 1,
  "dia_semana": "Lunes",
  "hora_inicio": "10:00",
  "hora_fin": "11:00"
}
```

---

### Reglas de negocio

| Regla                   | Código |
| ----------------------- | ------ |
| hora_inicio >= hora_fin | 400    |
| FK inexistente          | 400    |
| Solapamiento profesor   | 409    |
| Solapamiento alumno     | 409    |

---

### PATCH `/horarios/:id`

Permite modificar cualquier campo.

---

### DELETE `/horarios/:id`

Elimina horario.

---

# Relaciones

```
horarios → clases
horarios → profesores
horarios → alumnos
```

Eliminaciones en cascada.
