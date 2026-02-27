<script setup>
import { ref, onMounted } from "vue"
import Calendar from './components/Calendar.vue'

const horarios = ref([])
const clases = ref([])
const alumnos = ref([])
const profesores = ref([])

onMounted(async () => {
  const [resHorarios, resClases, resAlumnos, resProfesores] = await Promise.all([
    fetch("http://localhost:3000/horarios"),
    fetch("http://localhost:3000/clases"),
    fetch("http://localhost:3000/alumnos"),
    fetch("http://localhost:3000/profesores")
  ])

  horarios.value = await resHorarios.json()
  clases.value = await resClases.json()
  alumnos.value = await resAlumnos.json()
  profesores.value = await resProfesores.json()
})

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
      <h1>Escuela de Música AARDEM</h1>
      <p>Sistema de asignación de horarios para clases de instrumentos</p>
    </header>

    <main>
      <!-- Pasamos datos y funciones como props -->
      <Calendar 
        :horarios="horarios" 
        :clases="clases" 
        :alumnos="alumnos"
        :maestros="profesores"
        :onCrearRecurso="crearRecurso"
        @agregar-clase="agregarClase"
        @eliminar-clase="eliminarClase"
      />
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
}
header {
  background: #2c3e50;
  color: #fff;
  padding: 20px;
  text-align: center;
}
main { padding: 20px; }
footer {
  background: #2c3e50;
  color: #fff;
  text-align: center;
  padding: 10px;
  margin-top: 20px;
}
</style>
