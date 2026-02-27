<script setup>
import { ref, onMounted } from "vue"
import Calendar from './components/Calendar.vue'
import LoginButton from './components/LoginButton.vue'
import WeatherWidget from './components/WeatherWidget.vue'

const horarios = ref([])
const clases = ref([])
const alumnos = ref([])
const profesores = ref([])
const currentUser = ref(null)

onMounted(async () => {
  // Verificar si hay un usuario guardado en localStorage
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
  }
  
  // Cargar datos solo si hay usuario autenticado
  if (currentUser.value) {
    console.log('👤 Usuario autenticado:', currentUser.value.displayName)
    await loadData()
  } else {
    console.log('🔓 No hay usuario autenticado - mostrando login')
  }
})

async function loadData() {
  try {
    console.log('🔄 Cargando datos desde el servidor...')
    
    const [resHorarios, resClases, resAlumnos, resProfesores] = await Promise.all([
      fetch("http://localhost:3000/horarios"),
      fetch("http://localhost:3000/clases"),
      fetch("http://localhost:3000/alumnos"),
      fetch("http://localhost:3000/profesores")
    ])

    if (!resHorarios.ok || !resClases.ok || !resAlumnos.ok || !resProfesores.ok) {
      throw new Error('Error en una o más respuestas del servidor')
    }

    horarios.value = await resHorarios.json()
    clases.value = await resClases.json()
    alumnos.value = await resAlumnos.json()
    profesores.value = await resProfesores.json()
    
    console.log('✅ Datos cargados exitosamente')
    console.log('📊 Horarios:', horarios.value.length)
    console.log('📊 Clases:', clases.value.length)
    console.log('📊 Alumnos:', alumnos.value.length)
    console.log('📊 Profesores:', profesores.value.length)
  } catch (error) {
    console.error('❌ Error cargando datos:', error)
    alert('No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo.')
  }
}

// Función para manejar el login exitoso
function handleLoginSuccess(userData) {
  currentUser.value = userData.user
  localStorage.setItem('currentUser', JSON.stringify(userData.user))
  loadData()
}

// Función para cerrar sesión
function logout() {
  currentUser.value = null
  localStorage.removeItem('currentUser')
  horarios.value = []
  clases.value = []
  alumnos.value = []
  profesores.value = []
}

// Funciones para agregar/eliminar clases
async function agregarClase(nuevaClase) {
  const res = await fetch("http://localhost:3000/horarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevaClase)
  })
  const saved = await res.json()
  horarios.value.push(saved)
}

async function eliminarClase(id) {
  await fetch(`http://localhost:3000/horarios/${id}`, { method: "DELETE" })
  horarios.value = horarios.value.filter(h => h.id !== id)
}

async function crearRecurso(tipo, datos) {
  try {
    const res = await fetch(`http://localhost:3000/${tipo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    const nuevoRegistro = await res.json();
    
    if (res.ok) {
      // Actualizamos la lista correspondiente para que aparezca en el dropdown
      if (tipo === 'profesores') profesores.value.push(nuevoRegistro);
      if (tipo === 'alumnos') alumnos.value.push(nuevoRegistro);
      if (tipo === 'clases') clases.value.push(nuevoRegistro);
      
      return nuevoRegistro; // Retornamos el objeto con su nuevo ID
    } else {
      alert("Error: " + nuevoRegistro.error);
    }
  } catch (e) {
    console.error("Error de red", e);
  }
}

</script>

<template>
  <div id="app">
    <header>
      <div class="header-content">
        <div>
          <h1>Escuela de Música AARDEM</h1>
          <p>Sistema de asignación de horarios para clases de instrumentos</p>
        </div>
        <div v-if="currentUser" class="user-info">
          <span>{{ currentUser.displayName || currentUser.mail }}</span>
          <button @click="logout" class="logout-btn">Cerrar sesión</button>
        </div>
      </div>
    </header>

    <main>
      <!-- Mostrar login si no hay usuario autenticado -->
      <div v-if="!currentUser" class="login-section">
        <h2>Bienvenido al Sistema de Gestión</h2>
        <p>Por favor, inicia sesión con tu cuenta de Google para continuar</p>
        <LoginButton @login-success="handleLoginSuccess" />
      </div>
      
      <!-- Mostrar calendario si hay usuario autenticado -->
      <div v-else class="main-content">
        <div class="sidebar">
          <WeatherWidget />
        </div>
        <div class="calendar-section">
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
      </div>
    </main>

    <footer>
      <p>© 2026 Escuela de Música AARDEM</p>
    </footer>
  </div>
</template>

<style>
#app {
  font-family: "Fira Sans", Arial, sans-serif;
  margin: 0;
  background: #f4f4f4;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #2c3e50;
  color: #fff;
  padding: 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 14px;
}

.logout-btn:hover {
  background: #c0392b;
}

main { 
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.main-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

.calendar-section {
  flex: 1;
  min-width: 0;
}

.login-section {
  text-align: center;
  padding: 60px 20px;
}

.login-section h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.login-section p {
  color: #666;
  margin-bottom: 30px;
}

footer {
  background: #2c3e50;
  color: #fff;
  text-align: center;
  padding: 10px;
  margin-top: auto;
}
</style>
