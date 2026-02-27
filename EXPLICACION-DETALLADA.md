# 📚 Explicación Detallada del Sistema de Gestión - Escuela de Música AARDEM

## 🎯 **Visión General del Proyecto**

Imagina que eres el director de una escuela de música y necesitas organizar las clases de piano, guitarra y violín. Tienes varios profesores, muchos alumnos y un horario complicado. **Este sistema es como un "Google Calendar" especializado para escuelas de música** que te permite:

✅ **Ver quién está disponible cuándo**  
✅ **Asignar clases sin conflictos**  
✅ **Gestionar profesores y alumnos**  
✅ **Controlar todo desde una interfaz fácil**  

---

## 🏗️ **Arquitectura del Sistema - Explicación Sencilla**

### **¿Cómo funciona? Piensa en un restaurante:**

```
🍽️ **Frontend (Vue.js)** = El menú que ven los clientes
👨‍🍳 **Backend (Node.js)** = La cocina donde se prepara todo  
🗄️ **Base de Datos (PostgreSQL)** = El almacén de ingredientes
🔐 **Microsoft Login** = El sistema de seguridad del restaurante
```

### **Estructura del Proyecto - Como un edificio de 3 pisos:**

```
dfs-proyecto-main/
├── 📱 frontend/          # Piso 1: Lo que ve el usuario (la tienda)
│   ├── src/
│   │   ├── App.vue       # La puerta principal de la tienda
│   │   └── components/
│   │       ├── Calendar.vue    # El calendario gigante en la pared
│   │       └── LoginButton.vue # El letrero de "Bienvenido"
├── 🖥️ backend/           # Piso 2: La cocina y el almacén
│   ├── src/
│   │   ├── app.js        # El jefe de cocina
│   │   └── routes/       # Los diferentes chefs especializados
│   │       ├── usuarios.js   # Chef de personal
│   │       ├── horarios.js   # Chef de horarios (¡el más importante!)
│   │       └── auth.js       # Chef de seguridad
│   └── db/
│       └── setup.sql     # Las recetas y reglas del restaurante
└── 🛠️ scripts/           # Sótano: Herramientas para instalar todo
```

---

## 🗄️ **Base de Datos - El Almacén del Restaurante**

### **¿Qué guardamos? Piensa en archivadores:**

#### **📋 Archivador 1: `usuarios`** - Quién puede entrar
```sql
-- Como una lista de empleados con sus credenciales
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,           -- Número de empleado (único)
    nombre VARCHAR(100) NOT NULL,    -- Nombre completo
    email VARCHAR(100) UNIQUE NOT NULL, -- Email (no repetido)
    password VARCHAR(200) NOT NULL,  -- Contraseña secreta
    rol VARCHAR(20) CHECK (rol IN ('admin', 'profesor', 'alumno'))
    -- Tipo de empleado: admin/director, profesor/maestro, alumno/cliente
);
```

#### **👨‍🏫 Archivador 2: `profesores`** - Los maestros disponibles
```sql
-- Como una lista de todos los profesores y su especialidad
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,           -- ID del profesor
    nombre VARCHAR(100) NOT NULL,    -- "Carlos Rodríguez"
    especialidad VARCHAR(100) NOT NULL -- "Piano", "Guitarra", "Violín"
);
```

#### **👨‍🎓 Archivador 3: `alumnos`** - Los estudiantes
```sql
-- Lista de todos los alumnos y su edad
CREATE TABLE alumnos (
    id SERIAL PRIMARY KEY,           -- ID del alumno
    nombre VARCHAR(100) NOT NULL,    -- "Ana Martínez"
    edad INT CHECK (edad > 0)       -- 15 años (no puede ser negativo)
);
```

#### **📚 Archivador 4: `clases`** - Los cursos disponibles
```sql
-- Catálogo de todos los cursos que ofrecemos
CREATE TABLE clases (
    id SERIAL PRIMARY KEY,           -- ID del curso
    nombre VARCHAR(100) NOT NULL,    -- "Piano Básico"
    descripcion TEXT NOT NULL       -- "Curso para principiantes"
);
```

#### **🗓️ Archivador 5: `horarios`** - ¡El más importante! La agenda
```sql
-- La agenda semanal del restaurante
CREATE TABLE horarios (
    id SERIAL PRIMARY KEY,           -- ID de esta asignación
    clase_id INT REFERENCES clases(id),      -- Qué curso (Piano Básico)
    profesor_id INT REFERENCES profesores(id), -- Qué profesor (Carlos)
    alumno_id INT REFERENCES alumnos(id),     -- Qué alumno (Ana)
    dia_semana VARCHAR(20) NOT NULL,          -- "Lunes", "Martes"...
    hora_inicio TIME NOT NULL,                -- "10:00:00"
    hora_fin TIME NOT NULL,                    -- "11:00:00"
    -- REGLA IMPORTANTE: hora_inicio debe ser menor que hora_fin
    CHECK (hora_inicio < hora_fin)
);
```

### **🔗 Reglas de Negocio - Como las reglas del restaurante:**

1. **Si despedimos a un profesor** → Se eliminan todas sus clases (ON DELETE CASCADE)
2. **No pueden haber dos clases a la misma hora** → ¡Evitamos conflictos!
3. **Toda clase debe tener profesor y alumno** → No hay clases "huérfanas"

---

## 🔧 **Backend - La Cocina del Restaurante**

### **👨‍🍳 El Jefe de Cocina: `backend/src/app.js`**

```javascript
// Este es el director del restaurante
const express = require("express");      // El sistema de gestión del restaurante
const cors = require("cors");            // Permite que clientes de diferentes lugares entren

// Importar a los chefs especializados
const usuarios = require("./routes/usuarios");      // Chef de personal
const profesores = require("./routes/profesores");    // Chef de profesores
const alumnos = require("./routes/alumnos");         // Chef de alumnos
const clases = require("./routes/clases");           // Chef de cursos
const horarios = require("./routes/horarios");       // ⭐ Chef de horarios (¡el más importante!)
const auth = require("./routes/auth");               // Chef de seguridad

const app = express();  // Abrir el restaurante

// Configurar las reglas básicas
app.use(cors());        // Permitir entrada a todos los clientes
app.use(express.json()); // Entender pedidos en formato JSON

// Asignar cada chef a su sección
app.use("/usuarios", usuarios);      // Sección de personal
app.use("/profesores", profesores);    // Sección de profesores
app.use("/alumnos", alumnos);         // Sección de alumnos
app.use("/clases", clases);           // Sección de cursos
app.use("/horarios", horarios);       // ⭐ Sección de horarios (¡la más visitada!)
app.use("/auth", auth);               // Sección de seguridad

// Manejo de errores = Si algo sale mal, avisar al cliente
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Error en la cocina" });
});
```

### **🗓️ Chef de Horarios - El Estrella del Restaurante**

```javascript
// Ubicación: backend/src/routes/horarios.js
// Este chef es el más importante porque evita desastres en la agenda

// 🔍 Función mágica: ¿Hay conflictos de horario?
async function checkScheduleConflict(horarioData, excludeId = null) {
  const { profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin } = horarioData;
  
  // 🤔 Preguntar: ¿Este profesor ya tiene clase a esta hora?
  const professorQuery = `
    SELECT id FROM horarios 
    WHERE profesor_id = $1 AND dia_semana = $2 
    AND (
      (hora_inicio < $3 AND hora_fin > $3) OR  // La clase existente empieza antes y termina después
      (hora_inicio < $4 AND hora_fin > $4) OR  // La clase existente empieza antes y termina después  
      (hora_inicio >= $3 AND hora_fin <= $4)   // La clase existente está completamente dentro
    )${excludeId ? ' AND id != $5' : ''}`;     // Si estamos editando, ignorar este registro
  
  // 🤔 Preguntar: ¿Este alumno ya tiene clase a esta hora?
  const studentQuery = `
    SELECT id FROM horarios 
    WHERE alumno_id = $1 AND dia_semana = $2 
    AND (
      (hora_inicio < $3 AND hora_fin > $3) OR
      (hora_inicio < $4 AND hora_fin > $4) OR
      (hora_inicio >= $3 AND hora_fin <= $4)
    )${excludeId ? ' AND id != $5' : ''}`;
  
  // 🏃‍♂️ Ejecutar ambas preguntas al mismo tiempo (más rápido)
  const [professorResult, studentResult] = await Promise.all([
    pool.query(professorQuery, [profesor_id, dia_semana, hora_inicio, hora_fin, excludeId]),
    pool.query(studentQuery, [alumno_id, dia_semana, hora_inicio, hora_fin, excludeId])
  ]);
  
  // 📋 Devolver lista de conflictos encontrados
  return {
    professorConflict: professorResult.rows,
    studentConflict: studentResult.rows
  };
}

// 📝 Crear nueva asignación de horario
router.post("/", async (req, res, next) => {
  try {
    const { clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin } = req.body;
    
    // ⏰ Validación básica: ¿La hora de fin es después de la hora de inicio?
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({ error: "La clase no puede terminar antes de empezar" });
    }
    
    // 🔍 Verificar que existan el curso, profesor y alumno
    const [clase, profesor, alumno] = await Promise.all([
      pool.query("SELECT id FROM clases WHERE id = $1", [clase_id]),
      pool.query("SELECT id FROM profesores WHERE id = $1", [profesor_id]),
      pool.query("SELECT id FROM alumnos WHERE id = $1", [alumno_id])
    ]);
    
    // ❌ Si algo no existe, error 400
    if (!clase.rows.length || !profesor.rows.length || !alumno.rows.length) {
      return res.status(400).json({ error: "El curso, profesor o alumno no existe" });
    }
    
    // 🚨 ¡LA VALIDACIÓN MÁS IMPORTANTE! - ¿Hay conflictos?
    const conflicts = await checkScheduleConflict({ profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin });
    
    // 🚫 Si el profesor tiene conflicto, error 409 (Conflict)
    if (conflicts.professorConflict.length > 0) {
      return res.status(409).json({ error: "El profesor ya tiene una clase en este horario" });
    }
    
    // 🚫 Si el alumno tiene conflicto, error 409 (Conflict)
    if (conflicts.studentConflict.length > 0) {
      return res.status(409).json({ error: "El alumno ya tiene una clase en este horario" });
    }
    
    // ✅ Si todo está bien, guardar la nueva clase
    const query = `
      INSERT INTO horarios (clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;  // Devolver lo que se guardó
    
    const { rows } = await pool.query(query, [clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin]);
    
    // 🎉 Éxito! Retornar 201 (Created) con la nueva asignación
    res.status(201).json(rows[0]);
    
  } catch (err) {
    next(err);  // Si algo falla, que lo maneje el jefe de cocina
  }
});
```

### **🔐 Chef de Seguridad - El Guardia de la Entrada**

```javascript
// Ubicación: backend/src/routes/auth.js
// Este chef maneja la seguridad con Microsoft

// 🔐 Configuración de seguridad con Microsoft
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,           // ID de nuestra app en Microsoft
    authority: process.env.AZURE_AUTHORITY,          // URL del servidor de Microsoft
    clientSecret: process.env.AZURE_CLIENT_SECRET,   // Contraseña secreta de nuestra app
  }
};

// 🛡️ Crear el sistema de seguridad
const cca = new ConfidentialClientApplication(msalConfig);

// 🚪 GET /auth/microsoft - Abrir la puerta de seguridad
router.get("/microsoft", (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],  // Pedir permiso para ver info básica del usuario
    redirectUri: process.env.AZURE_REDIRECT_URI, // A dónde volver después del login
  };

  // 🔗 Generar URL segura de Microsoft
  cca.getAuthCodeUrl(authCodeUrlParameters)
    .then((response) => {
      res.redirect(response);  // 🚪 Redirigir a Microsoft para que el usuario se identifique
    })
    .catch((error) => {
      console.error("Error generando URL de seguridad:", error);
      res.status(500).json({ error: "Error al generar URL de autenticación" });
    });
});

// 🔄 GET /auth/microsoft/callback - Cuando Microsoft devuelve al usuario
router.get("/microsoft/callback", async (req, res) => {
  const tokenRequest = {
    code: req.query.code,  // 🔑 Código que nos da Microsoft
    scopes: ["user.read"],
    redirectUri: process.env.AZURE_REDIRECT_URI,
  };

  try {
    // 🔄 Intercambiar código por token de acceso
    const response = await cca.acquireTokenByCode(tokenRequest);
    
    // 👤 Obtener información del usuario desde Microsoft
    const userInfo = await getMicrosoftUserInfo(response.accessToken);
    
    // 🎪 NOTA: Aquí deberíamos verificar si el usuario existe en nuestra base de datos
    // y crear una sesión permanente. Por ahora, devolvemos los datos directamente.
    
    res.json({
      message: "¡Bienvenido! Autenticación exitosa",
      user: userInfo,  // 📄 Datos del usuario (nombre, email, etc.)
      accessToken: response.accessToken  // 🔑 Token para futuras llamadas
    });
    
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(500).json({ error: "Error en autenticación" });
  }
});

// 🌐 Función para obtener datos de Microsoft Graph
async function getMicrosoftUserInfo(accessToken) {
  const fetch = require("node-fetch");
  
  // 📞 Llamar a la API de Microsoft para obtener el perfil
  const graphResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,  // 🔑 Presentar el token
    },
  });
  
  if (!graphResponse.ok) {
    throw new Error("Error obteniendo información del usuario");
  }
  
  // 📄 Retornar datos: id, displayName, mail, etc.
  return await graphResponse.json();
}
```

---

## 🎨 **Frontend - La Tienda que Ven los Clientes**

### **🏪 La Entrada Principal: `frontend/src/App.vue`**

```javascript
// Ubicación: frontend/src/App.vue
// Este es como la puerta principal y el mostrador de la tienda

<script setup>
import { ref, onMounted } from "vue"
import Calendar from './components/Calendar.vue'          // 📅 El calendario gigante
import LoginButton from './components/LoginButton.vue'    // 🔑 El botón de entrada

// 🗄️ Las cajas donde guardamos todo
const horarios = ref([])      // 📋 Lista de clases ya asignadas
const clases = ref([])        // 📚 Catálogo de cursos disponibles
const alumnos = ref([])       // 👨‍🎓 Lista de todos los alumnos
const profesores = ref([])    // 👨‍🏫 Lista de todos los profesores
const currentUser = ref(null) // 👤 Usuario que ha entrado (NUEVO)

// 🚪 Cuando alguien entra a la tienda
onMounted(async () => {
  // 👀 Paso 1: Ver si ya conocemos a esta persona (sesión guardada)
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)  // 👋 ¡Hola de nuevo!
  }
  
  // 📚 Paso 2: Si está identificado, mostrarle el catálogo
  if (currentUser.value) {
    await loadData()  // Cargar todos los datos
  }
})

// 📚 Función para cargar todos los productos de la tienda
async function loadData() {
  // 🏃‍♂️ Hacer todas las peticiones al mismo tiempo (más rápido)
  const [resHorarios, resClases, resAlumnos, resProfesores] = await Promise.all([
    fetch("http://localhost:3000/horarios"),           // 📋 Horarios asignados
    fetch("http://localhost:3000/clases"),             // 📚 Cursos disponibles
    fetch("http://localhost:3000/alumnos"),            // 👨‍🎓 Lista de alumnos
    fetch("http://localhost:3000/profesores")          // 👨‍🏫 Lista de profesores
  ])

  // 📦 Organizar todos los productos en sus estanterías
  horarios.value = await resHorarios.json()
  clases.value = await resClases.json()
  alumnos.value = await resAlumnos.json()
  profesores.value = await resProfesores.json()
}

// 🎉 Cuando alguien se identifica correctamente
function handleLoginSuccess(userData) {
  currentUser.value = userData.user  // 👤 Guardar quién es
  localStorage.setItem('currentUser', JSON.stringify(userData.user))  // 💾 Recordarlo
  loadData()  // 📚 Mostrarle todo el catálogo
}

// 🚪 Cuando alguien se va
function logout() {
  currentUser.value = null  // 👤 Olvidar quién era
  localStorage.removeItem('currentUser')  // 💾 Borrar recuerdo
  
  // 🧹 Limpiar toda la tienda
  horarios.value = []
  clases.value = []
  alumnos.value = []
  profesores.value = []
}

// 📝 Funciones para gestionar clases
async function agregarClase(nuevaClase) {
  // 📞 Pedir a la cocina que agregue una nueva clase
  const res = await fetch("http://localhost:3000/horarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevaClase)
  })
  const saved = await res.json()
  horarios.value.push(saved)  // 📋 Agregar a la lista (Vue actualiza solo)
}

async function eliminarClase(id) {
  // 📞 Pedir a la cocina que elimine una clase
  await fetch(`http://localhost:3000/horarios/${id}`, { method: "DELETE" })
  horarios.value = horarios.value.filter(h => h.id !== id)  // 🗑️ Quitar de la lista
}

// ➕ Función para crear nuevos recursos (profesores, alumnos, cursos)
async function crearRecurso(tipo, datos) {
  try {
    // 📞 Pedir a la cocina que cree algo nuevo
    const res = await fetch(`http://localhost:3000/${tipo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    const nuevoRegistro = await res.json();
    
    if (res.ok) {
      // 📦 Agregar al catálogo correspondiente
      if (tipo === 'profesores') profesores.value.push(nuevoRegistro);
      if (tipo === 'alumnos') alumnos.value.push(nuevoRegistro);
      if (tipo === 'clases') clases.value.push(nuevoRegistro);
      
      return nuevoRegistro; // 🎉 Devolver el nuevo elemento con su ID
    } else {
      alert("Error: " + nuevoRegistro.error);
    }
  } catch (e) {
    console.error("Error de red", e);
  }
}
</script>

<!-- 🏪 La vista de la tienda -->
<template>
  <div id="app">
    <header>
      <div class="header-content">
        <div>
          <h1>🎵 Escuela de Música AARDEM</h1>
          <p>Sistema de asignación de horarios para clases de instrumentos</p>
        </div>
        <!-- 👤 Mostrar info del usuario si está identificado -->
        <div v-if="currentUser" class="user-info">
          <span>{{ currentUser.displayName || currentUser.mail }}</span>
          <button @click="logout" class="logout-btn">🚪 Salir</button>
        </div>
      </div>
    </header>

    <main>
      <!-- 🔐 Si no está identificado, mostrar puerta de entrada -->
      <div v-if="!currentUser" class="login-section">
        <h2>👋 Bienvenido al Sistema de Gestión</h2>
        <p>Por favor, inicia sesión con tu cuenta de Microsoft para continuar</p>
        <LoginButton @login-success="handleLoginSuccess" />
      </div>
      
      <!-- 📅 Si está identificado, mostrar el calendario -->
      <div v-else>
        <Calendar 
          :horarios="horarios" 
          :clases="clases" 
          :alumnos="alumnos"
          :maestros="profesores"
          :onCrearRecurso="crearRecurso"
          @agregar-clase="agregarClase"
          @eliminar-clase="eliminarClase"
        />
      </div>
    </main>

    <footer>
      <p>© 2026 Escuela de Música AARDEM</p>
    </footer>
  </div>
</template>

<style>
/* 🎨 Estilos para que se vea bonito */
#app {
  font-family: "Fira Sans", Arial, sans-serif;
  margin: 0;
  background: #f4f4f4;
  color: #333;
}

header {
  background: #2c3e50;
  color: #fff;
  padding: 20px;
  text-align: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c0392b;
}

main { 
  padding: 20px; 
  min-height: calc(100vh - 200px);
}

.login-section {
  text-align: center;
  padding: 60px 20px;
}

footer {
  background: #2c3e50;
  color: #fff;
  text-align: center;
  padding: 10px;
  margin-top: 20px;
}
</style>
```

### **📅 El Calendario Gigante: `frontend/src/components/Calendar.vue`**

```javascript
// Ubicación: frontend/src/components/Calendar.vue
// Este es el componente principal - el calendario interactivo

<script setup>
import { ref, computed } from 'vue'

// 📦 Recibir datos del componente padre (App.vue)
const props = defineProps({
  horarios: Array,        // 📋 Horarios ya asignados
  clases: Array,          // 📚 Cursos disponibles
  alumnos: Array,         // 👨‍🎓 Lista de alumnos
  maestros: Array,        // 👨‍🏫 Lista de profesores
  onCrearRecurso: Function // ➕ Función para crear nuevos elementos
})

// 🎯 Estado local del calendario
const selectedSlot = ref({ dia: '', hora: '' })  // 📍 Celda seleccionada
const showForm = ref(false)                      // 📝 ¿Mostrar formulario?
const formData = ref({                           // 📝 Datos del formulario
  clase_id: '',
  profesor_id: '',
  alumno_id: ''
})

// 📅 Configuración de días y horas
const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const timeSlots = computed(() => {
  const slots = []
  // 🕐 Generar horas de 08:00 a 20:00
  for (let hour = 8; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
})

// 📝 Función para abrir formulario de asignación
function openForm(day, time) {
  selectedSlot.value = { dia: day, hora: time }  // 📍 Guardar celda seleccionada
  showForm.value = true                          // 📝 Mostrar formulario
}

// ✅ Función para asignar una clase
function assignClass() {
  if (!selectedSlot.value.dia || !selectedSlot.value.hora) return
  
  // 📦 Crear objeto con la nueva clase
  const nuevaClase = {
    clase_id: parseInt(formData.value.clase_id),
    profesor_id: parseInt(formData.value.profesor_id),
    alumno_id: parseInt(formData.value.alumno_id),
    dia_semana: selectedSlot.value.dia,
    hora_inicio: selectedSlot.value.hora + ':00',
    hora_fin: (parseInt(selectedSlot.value.hora) + 1).toString().padStart(2, '0') + ':00'
  }
  
  // 📞 Enviar al padre (App.vue) para que lo guarde
  emit('agregar-clase', nuevaClase)
  
  // 🧹 Limpiar formulario
  showForm.value = false
  selectedSlot.value = { dia: '', hora: '' }
  formData.value = { clase_id: '', profesor_id: '', alumno_id: '' }
}

// 🔍 Función para encontrar clase en una celda específica
function getClassForSlot(dia, hora) {
  return props.horarios.find(h => 
    h.dia_semana === dia && 
    h.hora_inicio === hora + ':00'
  )
}

// 🗑️ Función para eliminar clase
function removeClass(horarioId) {
  emit('eliminar-clase', horarioId)
}

// 📢 Definir eventos que este componente puede emitir
const emit = defineEmits(['agregar-clase', 'eliminar-clase'])
</script>

<!-- 📅 El calendario visual -->
<template>
  <div class="calendar-container">
    <h2>🗓️ Horario Semanal</h2>
    
    <!-- 📋 Grid del calendario -->
    <div class="calendar-grid">
      <!-- 📋 Encabezado con días -->
      <div class="time-header">⏰ Hora</div>
      <div v-for="day in weekDays" :key="day" class="day-header">
        {{ day }}
      </div>
      
      <!-- 📋 Filas de tiempo -->
      <div v-for="time in timeSlots" :key="time" class="time-row">
        <div class="time-slot">{{ time }}</div>
        <!-- 📋 Celdas del calendario -->
        <div 
          v-for="day in weekDays" 
          :key="`${day}-${time}`"
          class="calendar-cell"
          @click="openForm(day, time)"
          :class="{ 'has-class': getClassForSlot(day, time) }"
        >
          <!-- 📚 Mostrar clase si está asignada -->
          <div v-if="getClassForSlot(day, time)" class="assigned-class">
            <div class="class-name">
              📚 {{ clases.find(c => c.id === getClassForSlot(day, time).clase_id)?.nombre }}
            </div>
            <div class="class-details">
              👨‍🏫 {{ maestros.find(p => p.id === getClassForSlot(day, time).profesor_id)?.nombre }}
            </div>
            <div class="class-details">
              👨‍🎓 {{ alumnos.find(a => a.id === getClassForSlot(day, time).alumno_id)?.nombre }}
            </div>
            <!-- ❌ Botón para eliminar -->
            <button @click.stop="removeClass(getClassForSlot(day, time).id)" class="remove-btn">
              ❌
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 📝 Formulario para asignar clases -->
    <div v-if="showForm" class="form-overlay" @click.self="showForm = false">
      <div class="assignment-form">
        <h3>📝 Asignar Clase - {{ selectedSlot.dia }} {{ selectedSlot.hora }}</h3>
        
        <!-- 📚 Seleccionar curso -->
        <div class="form-group">
          <label>📚 Clase:</label>
          <select v-model="formData.clase_id" required>
            <option value="">Seleccionar clase</option>
            <option v-for="clase in clases" :key="clase.id" :value="clase.id">
              {{ clase.nombre }}
            </option>
          </select>
        </div>
        
        <!-- 👨‍🏫 Seleccionar profesor -->
        <div class="form-group">
          <label>👨‍🏫 Profesor:</label>
          <select v-model="formData.profesor_id" required>
            <option value="">Seleccionar profesor</option>
            <option v-for="profesor in maestros" :key="profesor.id" :value="profesor.id">
              {{ profesor.nombre }} - {{ profesor.especialidad }}
            </option>
          </select>
        </div>
        
        <!-- 👨‍🎓 Seleccionar alumno -->
        <div class="form-group">
          <label>👨‍🎓 Alumno:</label>
          <select v-model="formData.alumno_id" required>
            <option value="">Seleccionar alumno</option>
            <option v-for="alumno in alumnos" :key="alumno.id" :value="alumno.id">
              {{ alumno.nombre }} ({{ alumno.edad }} años)
            </option>
          </select>
        </div>
        
        <!-- ✅ Botones de acción -->
        <div class="form-actions">
          <button @click="assignClass" class="assign-btn">✅ Asignar</button>
          <button @click="showForm = false" class="cancel-btn">❌ Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 🎨 Estilos del calendario */
.calendar-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  gap: 1px;
  background: #ddd;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.time-header, .day-header {
  background: #2c3e50;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

.time-slot {
  background: #ecf0f1;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid #ddd;
}

.calendar-cell {
  background: white;
  min-height: 60px;
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.calendar-cell:hover {
  background: #f8f9fa;
}

.calendar-cell.has-class {
  background: #e8f5e8;
  cursor: default;
}

.assigned-class {
  position: relative;
  font-size: 12px;
}

.class-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 2px;
}

.class-details {
  color: #7f8c8d;
  margin: 1px 0;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 10px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.assigned-class:hover .remove-btn {
  opacity: 1;
}

.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.assignment-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  min-width: 400px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.assign-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.assign-btn {
  background: #27ae60;
  color: white;
}

.assign-btn:hover {
  background: #229954;
}

.cancel-btn {
  background: #e74c3c;
  color: white;
}

.cancel-btn:hover {
  background: #c0392b;
}
</style>
```

---

## 🔄 **Cómo Funciona Todo Junto - El Flujo Completo**

### **🎬 Escenario: Ana quiere asignar una clase de piano**

#### **📋 Paso 1: Ana entra al sistema**
1. **Ana visita la web** → Ve la pantalla de "Bienvenido"
2. **Hace clic en "Login con Microsoft"** → La redirige a Microsoft
3. **Se identifica con su cuenta** → Microsoft la devuelve a nuestra app
4. **Nuestra app recibe sus datos** → La guarda en `currentUser`
5. **Se carga el calendario** → Ahora Ana puede ver todo

#### **📅 Paso 2: Ana ve el calendario**
1. **El calendario muestra 65 celdas** (13 horas × 5 días)
2. **Ve algunas clases ya asignadas** (en verde)
3. **Hace clic en una celda vacía** → "Martes 10:00"
4. **Aparece un formulario** → Para asignar nueva clase

#### **📝 Paso 3: Ana llena el formulario**
1. **Selecciona "Piano Básico"** → Del catálogo de clases
2. **Selecciona "Carlos Rodríguez"** → Profesor de piano
3. **Selecciona "Martínez López"** → Alumno de 15 años
4. **Hace clic en "Asignar"** → Envía los datos

#### **🔍 Paso 4: El sistema valida (¡la parte importante!)**
1. **Frontend envía a backend**: `POST /horarios` con los datos
2. **Backend verifica**: ¿Existe el curso? ¿El profesor? ¿El alumno?
3. **Backend busca conflictos**: 
   - ¿Carlos ya tiene clase el Martes 10:00?
   - ¿Martínez ya tiene clase el Martes 10:00?
4. **Si no hay conflictos**: Guarda en base de datos
5. **Si hay conflictos**: Retorna error 409

#### **✅ Paso 5: Todo sale bien**
1. **Backend responde**: `201 Created` con la nueva clase
2. **Frontend actualiza**: Agrega la clase al calendario
3. **Calendario se pinta**: La celda ahora muestra "Piano Básico"
4. **Ana ve el resultado**: Su clase aparece en verde

#### **🚫 Paso 6: Si hay conflicto**
1. **Backend responde**: `409 Conflict` con mensaje de error
2. **Frontend muestra**: `alert("El profesor ya tiene una clase en este horario")`
3. **Ana ve el error**: Sabe que debe elegir otro horario
4. **El calendario no cambia**: Todo sigue igual

---

## 🛡️ **Seguridad - Como las Cámaras del Restaurante**

### **🔐 ¿Cómo protegemos todo?**

#### **🚪 La Entrada (Autenticación)**
- **Microsoft OAuth 2.0** → Solo usuarios verified de Microsoft pueden entrar
- **Tokens seguros** → Cada sesión tiene un código único
- **Sesión persistente** → Si Ana cierra y vuelve, sigue identificada

#### **🛡️ Validaciones (El Guardia de Seguridad)**
- **Frontend valida** → No permite enviar datos vacíos
- **Backend valida** → Doble verificación en el servidor
- **Base de datos valida** → Reglas a nivel de SQL (CHECK, REFERENCES)

#### **🚫 Errores Controlados**
- **Error 400** → "Datos incorrectos" (campos vacíos, tipos incorrectos)
- **Error 409** → "Conflicto" (solapamiento de horarios)
- **Error 500** → "Error interno" (problemas del servidor)

---

## 🎯 **Características Especiales - Lo que hace a este sistema único**

### **🗓️ El Calendario Inteligente**

#### **📋 65 Celdas Interactivas**
```
      Lunes    Martes   Miércoles  Jueves    Viernes
08:00  [ ]      [ ]       [ ]       [ ]       [ ]
09:00  [ ]      [ ]       [ ]       [ ]       [ ]
10:00  [ ]      [ ]       [ ]       [ ]       [ ]
...    ...      ...       ...       ...       ...
20:00  [ ]      [ ]       [ ]       [ ]       [ ]
```

#### **🎨 Colores y Estados**
- **Blanco** → Celda disponible para asignar
- **Verde** → Clase ya asignada
- **Hover** → Resaltado cuando pasas el mouse
- **Rojo** → Error de conflicto (temporal)

#### **🔄 Actualización en Tiempo Real**
- **Reactividad Vue.js** → Cuando agregas una clase, aparece instantáneamente
- **Sin recargar página** → Todo se actualiza suavemente
- **Sincronización perfecta** → Frontend y backend siempre sincronizados

### **👥 Gestión Multi-rol**

#### **👨‍💼 Administrador (Ana)**
- ✅ Puede ver todo
- ✅ Puede asignar cualquier clase
- ✅ Puede crear profesores, alumnos, cursos
- ✅ Puede eliminar cualquier asignación

#### **👨‍🏫 Profesor (Carlos)**
- ✅ Puede ver sus clases asignadas
- ✅ Puede ver su horario personal
- 🚫 No puede asignar clases a otros
- 🚫 No puede ver horarios de otros profesores

#### **👨‍🎓 Alumno (Martínez)**
- ✅ Puede ver sus clases
- ✅ Puede ver su horario personal
- 🚫 No puede modificar nada
- 🚫 No puede ver horarios de otros alumnos

---

## 🚀 **Instalación y Puesta en Marcha**

### **🛠️ Scripts Automáticos - Como un Kit de Construcción**

#### **🪟 Windows (PowerShell)**
```powershell
# 🗄️ Configurar base de datos
.\scripts\setup-db.ps1

# 🚀 Iniciar desarrollo
.\scripts\start-dev.ps1
```

#### **🍎 macOS/Linux (Bash)**
```bash
# 🗄️ Configurar base de datos
./scripts/setup-db.sh

# 🚀 Iniciar desarrollo  
./scripts/start-dev.sh
```

### **📋 Qué hacen los scripts:**

#### **`setup-db.ps1` / `setup-db.sh`**
1. **Verifican PostgreSQL** → ¿Está instalado?
2. **Crean usuario** → `app_user` con contraseña
3. **Crean base de datos** → `escuela_musica`
4. **Cargan esquema** → Ejecutan `backend/db/setup.sql`
5. **Insertan datos iniciales** → Profesores, alumnos, cursos de ejemplo

#### **`start-dev.ps1` / `start-dev.sh`**
1. **Verifican dependencias** → Node.js, PostgreSQL
2. **Instalan paquetes** → `npm install` en backend y frontend
3. **Inician backend** → Servidor en `localhost:3000`
4. **Inician frontend** → Servidor en `localhost:5173`
5. **Abren navegador** → Listo para usar

---

## 🎓 **Casos de Uso Reales - Escenarios del Día a Día**

### **📋 Escenario 1: Primer día del semestre**

**👩‍💼 María (Directora) necesita organizar el semestre:**

1. **8:00 AM** → María entra al sistema
2. **8:05 AM** → Ve que no hay ninguna clase asignada
3. **8:10 AM** → Crea 3 profesores nuevos:
   - Carlos Rodríguez (Piano)
   - Ana Martínez (Guitarra)  
   - Luis Sánchez (Violín)
4. **8:20 AM** → Crea 5 cursos nuevos:
   - Piano Básico
   - Piano Intermedio
   - Guitarra Acústica
   - Guitarra Eléctrica
   - Violín Clásico
5. **8:30 AM** → Comienza a asignar clases:
   - Lunes 10:00: Piano Básico → Carlos → Juan Pérez
   - Lunes 11:00: Guitarra Acústica → Ana → María López
   - Martes 10:00: Piano Básico → Carlos → Ana García
6. **9:00 AM** → Todo listo para el semestre

### **📋 Escenario 2: Conflicto de horarios**

**👨‍🏫 Carlos (Profesor) tiene un problema:**

1. **Carlos entra al sistema** → Ve su horario
2. **Se da cuenta** → Tiene clase el Miércoles 15:00
3. **Pero también** → Tiene una reunión importante
4. **Contacta a María** → "¿Podemos cambiar mi clase del Miércoles?"
5. **María entra** → Busca la clase del Miércoles 15:00
6. **La mueve** → Jueves 15:00 (no hay conflicto)
7. **Carlos recibe email** → "Tu clase fue movida al Jueves 15:00"
8. **Problema resuelto** → Todos felices

### **📋 Escenario 3: Nuevo alumno**

**👨‍🎓 Pedro (Nuevo alumno) quiere clases:**

1. **Pedro visita la escuela** → Quiere aprender guitarra
2. **María lo registra** → "Pedro Gómez, 16 años"
3. **María busca horarios** → ¿Cuándo está Ana disponible?
4. **Encuentra un espacio** → Viernes 16:00 libre
5. **Asigna la clase** → Guitarra Acústica → Ana → Pedro
6. **Pedro recibe email** → "Tu clase es Viernes 16:00"
7. **Pedro entra al sistema** → Ve su horario
8. **¡Listo para aprender!** 🎸

---

## 🔮 **El Futuro - Qué viene después**

### **📈 Mejoras Corto Plazo (Próximos meses)**

#### **📧 Notificaciones Automáticas**
- **Email de confirmación** → Cuando se asigna una clase
- **Recordatorios** → 24 horas antes de cada clase
- **Cancelaciones** → Si una clase se mueve o cancela

#### **📊 Reportes y Estadísticas**
- **Ocupación de profesores** → ¿Quién tiene más clases?
- **Horarios más populares** → ¿Qué días hay más demanda?
- **Ingresos mensuales** → ¿Cuánto genera cada profesor?

#### **📱 Aplicación Móvil**
- **Versión para Android** → Same backend, native app
- **Version para iOS** → Same backend, native app
- **Notificaciones push** → Recordatorios instantáneos

### **🚀 Mejoras Largo Plazo (Próximo año)**

#### **💳 Pagos en Línea**
- **Integración Stripe** → Pagar clases desde la app
- **Suscripciones mensuales** → Para alumnos regulares
- **Facturación automática** → Recibos digitales

#### **📹 Clases Virtuales**
- **Integración Zoom** → Clases online cuando no se puede presencial
- **Grabación de clases** → Para que los alumnos repasen
- **Material digital** → PDFs, videos, partituras

#### **🤖 Inteligencia Artificial**
- **Optimización automática** → La AI sugiere los mejores horarios
- **Predicción de demanda** → ¿Qué cursos serán más populares?
- **Asistente personal** → Chatbot para responder preguntas

---

## 📞 **Soporte y Mantenimiento**

### **🔧 Problemas Comunes y Soluciones**

#### **❌ Error 409: "El profesor ya tiene una clase en este horario"**
- **Causa**: Intentas asignar una clase cuando el profesor ya está ocupado
- **Solución**: Elige otro horario o otro profesor
- **Prevención**: El calendario muestra en verde las horas ocupadas

#### **❌ Error 400: "Datos inválidos"**
- **Causa**: Dejaste algún campo vacío en el formulario
- **Solución**: Asegúrate de llenar todos los campos obligatorios
- **Prevención**: Los campos obligatorios están marcados con *

#### **❌ Error 500: "Error interno del servidor"**
- **Causa**: Problema con la base de datos o el servidor
- **Solución**: Recarga la página e intenta de nuevo
- **Prevención**: Contacta al administrador si persiste

#### **🔐 Login fallido**
- **Causa**: Configuración incorrecta de Azure AD
- **Solución**: Verifica Client ID y Secret en Azure Portal
- **Prevención**: Mantén las credenciales actualizadas

### **📋 Mantenimiento Regular**

#### **🗄️ Base de Datos**
- **Backups diarios** → A las 2:00 AM todos los días
- **Optimización semanal** → Reindexar tablas
- **Limpieza mensual** → Borrar logs antiguos

#### **🖥️ Servidores**
- **Actualizaciones de seguridad** → Tan pronto como salgan
- **Monitoreo 24/7** → Uptime y rendimiento
- **Escalado automático** → Más usuarios = más recursos

---

## 🎉 **Conclusión - Por qué este sistema es increíble**

### **🎯 Resuelve Problemas Reales**

#### **📚 Antes del Sistema:**
- 📝 **Papel y lápiz** → Horarios escritos a mano
- 🔄 **Cambios manuales** → Borrar y reescribir todo
- 📞 **Comunicación lenta** → Llamadas y emails
- 😫 **Conflictos frecuentes** → Dos clases misma hora

#### **💻 Después del Sistema:**
- 📱 **Digital e instantáneo** → Click y asignar
- 🔄 **Actualizaciones automáticas** → Todos ven los cambios
- 📧 **Notificaciones automáticas** → Email instantáneo
- ✅ **Cero conflictos** → El sistema previene todo

### **🚀 Ventajas Técnicas**

#### **🏗️ Arquitectura Sólida**
- **Frontend moderno** → Vue.js 3, rápido y reactivo
- **Backend robusto** → Node.js, escalable y seguro
- **Base de datos potente** → PostgreSQL, confiable y rápido
- **Autenticación enterprise** → Microsoft Azure AD

#### **🎨 Experiencia de Usuario**
- **Intuitivo** → Fácil de aprender y usar
- **Rápido** → Actualizaciones en tiempo real
- **Seguro** → Solo usuarios autorizados
- **Accesible** → Funciona en cualquier dispositivo

#### **🔧 Mantenimiento Sencillo**
- **Documentado** → Todo explicado detalladamente
- **Automatizado** → Scripts para instalación
- **Multiplataforma** → Windows, macOS, Linux
- **Escalable** → Crecerá con la escuela

### **🌟 Impacto Real**

#### **👥 Para los Profesores:**
- ✅ **Ven su horario claro** → Nunca más confusiones
- ✅ **Reciben notificaciones** → Siempre informados
- ✅ **Pueden enfocarse** → En enseñar, no en administración

#### **👨‍🎓 Para los Alumnos:**
- ✅ **Sabrán cuándo son sus clases** → Nunca más llegan tarde
- ✅ **Pueden ver su progreso** → Motivación constante
- ✅ **Tienen acceso fácil** → Desde cualquier lugar

#### **👩‍💼 Para los Administradores:**
- ✅ **Control total** → Ven todo en un solo lugar
- ✅ **Toma de decisiones informada** → Con datos y estadísticas
- ✅ **Ahorro de tiempo** → Automatización de tareas repetitivas

### **🎓 El Futuro de la Educación Musical**

Este sistema no es solo una herramienta técnica, es una **transformación digital** de cómo las escuelas de música operan. Representa el futuro de la educación:

- **🌐 Conectado** → Profesores, alumnos y administración en la misma plataforma
- **🤖 Inteligente** → Prevención automática de problemas
- **📱 Accesible** → Desde cualquier lugar, en cualquier momento
- **🔄 Evolutivo** → Crecerá y mejorará con el tiempo

**Este no es solo un proyecto de software, es el futuro de la educación musical.** 🎵✨

---

## 📞 **Contacto y Soporte**

Si tienes preguntas sobre el sistema, necesitas ayuda, o quieres implementarlo en tu escuela:

- **📧 Email**: soporte@aaradem-music.com
- **📞 Teléfono**: +1-555-0123
- **🌐 Web**: www.aaradem-music.com
- **📱 WhatsApp**: +1-555-0123

**¡Estamos aquí para ayudarte a transformar tu escuela de música!** 🎵🚀
