<template>
  <div class="container">
    <!-- Calendario -->
    <div class="card calendario">
      <h2>Calendario Semanal</h2>
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th v-for="day in days" :key="day">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <!-- Sábado primero -->
          <tr v-for="slot in saturdaySlots" :key="slot">
            <td>{{ slot }}</td>
            <td v-for="day in days.slice(0,5)" :key="day"></td>
            <td :id="`Sábado-${slot}`" @click="openOptions('Sábado', slot)">
              {{ calendar[`Sábado-${slot}`]?.texto || "" }}
            </td>
          </tr>

          <!-- Lunes a viernes después -->
          <tr v-for="slot in weekdaySlots" :key="slot">
            <td>{{ slot }}</td>
            <td v-for="day in days.slice(0,5)" 
                :key="day" 
                :id="`${day}-${slot}`"
                @click="openOptions(day, slot)">
              {{ calendar[`${day}-${slot}`]?.texto || "" }}
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <p>{{ message }}</p>
    </div>

    <!-- Panel lateral -->
    <div class="card asignadas">
      <h2>Clases asignadas</h2>
      <ul>
        <li v-for="(info, key) in calendar" :key="key">
          {{ key }} → {{ info.texto }}
        </li>
      </ul>
    </div>

    <!-- Modal de opciones -->
    <div v-if="showOptions" class="modal">
      <div class="modal-content">
        <h3>Opciones para {{ selectedSlot }}</h3>

        <div v-if="calendar[selectedSlot]">
          <p>Clase actual: {{ calendar[selectedSlot].texto }}</p>
          <button class="btn-danger" @click="removeClass">Eliminar clase</button>
        </div>
        <div v-else>
          <p>No hay clase asignada.</p>

          <label>Maestro:</label>
          <select v-model="selectedMaestro">
            <option disabled value="">-- elegir --</option>
            <option v-for="m in maestros" :key="m.id" :value="m.id">{{ m.nombre }}</option>
            <option value="nuevo">+ Agregar Nuevo Maestro</option>
          </select>
          <div v-if="selectedMaestro === 'nuevo'" class="nuevo-input">
            <input v-model="nuevoNombreMaestro" placeholder="Nombre del maestro">
            <input v-model="nuevaEspecialidad" placeholder="Especialidad (ej. Piano)">
          </div>
          <br>

          <label>Alumno:</label>
          <select v-model="selectedAlumno">
            <option disabled value="">-- elegir --</option>
            <option v-for="a in alumnos" :key="a.id" :value="a.id">{{ a.nombre }}</option>
            <option value="nuevo">+ Agregar Nuevo Alumno</option>
          </select>
          <div v-if="selectedAlumno === 'nuevo'" class="nuevo-input">
            <input v-model="nuevoNombreAlumno" placeholder="Nombre del alumno">
          </div>
          <br>

          <label>Clase/Instrumento:</label>
          <select v-model="selectedClase">
            <option disabled value="">-- elegir --</option>
            <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            <option value="nuevo">+ Agregar Nueva Clase</option>
          </select>
          <div v-if="selectedClase === 'nuevo'" class="nuevo-input">
            <input v-model="nuevoNombreClase" placeholder="Nombre (ej. Violín Básico)">
          </div>
          <br>

          <button @click="confirmarClase">Confirmar Todo</button>
        </div>
        <button @click="closeOptions">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'

// Props que vienen del App.vue
const props = defineProps({
  horarios: Array,
  maestros: Array,
  alumnos: Array,
  clases: Array,
  onCrearRecurso: Function
})

// Logging para ver qué datos llegan
console.log('📥 Props recibidos en Calendar:', {
  maestros: props.maestros?.length || 0,
  alumnos: props.alumnos?.length || 0,
  clases: props.clases?.length || 0,
  horarios: props.horarios?.length || 0
});

// Logging detallado de los datos
console.log('👥 Maestros:', props.maestros);
console.log('🎓 Alumnos:', props.alumnos);
console.log('📚 Clases:', props.clases);

const emit = defineEmits(["agregar-clase","eliminar-clase", "crear-recurso"])

const days = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
const calendar = reactive({})
const message = ref("")
const showOptions = ref(false)
const selectedSlot = ref("")

// Campos seleccionados
const selectedMaestro = ref("")
const selectedAlumno = ref("")
const selectedClase = ref("")
const selectedSalon = ref("")

// Variables temporales para los nuevos registros
const nuevoNombreMaestro = ref("")
const nuevaEspecialidad = ref("")
const nuevoNombreAlumno = ref("")
const nuevoNombreClase = ref("")

// Watchers para ver si los valores cambian
watch(selectedMaestro, (newVal) => {
  console.log('🎓 Maestro seleccionado cambió:', newVal);
});

watch(selectedAlumno, (newVal) => {
  console.log('👤 Alumno seleccionado cambió:', newVal);
});

watch(selectedClase, (newVal) => {
  console.log('📚 Clase seleccionada cambió:', newVal);
});

// Horarios de sábado: 10:00 → 13:45
const saturdaySlots = computed(() => {
  const slots = []
  let start = new Date(0,0,0,10,0)
  for (let i=0; i<6; i++) { // 10:00, 10:45, 11:30, 12:15, 13:00, 13:45
    const time = new Date(start.getTime() + i*45*60000)
    slots.push(time.toTimeString().slice(0,5))
  }
  return slots
})

// Horarios de lunes a viernes: 14:30 → 19:00
const weekdaySlots = computed(() => {
  const slots = []
  let start = new Date(0,0,0,14,30)
  for (let i=0; i<7; i++) { // 14:30, 15:15, 16:00, 16:45, 17:30, 18:15, 19:00
    const time = new Date(start.getTime() + i*45*60000)
    slots.push(time.toTimeString().slice(0,5))
  }
  return slots
})

// Función centralizada para construir el calendario
const construirCalendario = () => {
  // 1. Validar que tengamos todos los datos necesarios antes de mapear
  if (!props.horarios.length || !props.maestros.length || !props.clases.length) {
    return;
  }

  // 2. Limpiar sin perder reactividad
  Object.keys(calendar).forEach(key => delete calendar[key]);

  // 3. Mapear
  props.horarios.forEach(h => {
    // Manejo de seguridad para la hora (API devuelve HH:mm:ss o HH:mm)
    const horaLimpia = h.hora_inicio ? h.hora_inicio.slice(0, 5) : "";
    const dia = h.dia_semana || h.dia;

    if (!horaLimpia || !dia) return;

    const key = `${dia}-${horaLimpia}`;

    const maestro = props.maestros.find(m => m.id === h.profesor_id);
    const clase = props.clases.find(c => c.id === h.clase_id);

    calendar[key] = {
      id: h.id, 
      texto: `${clase?.nombre || 'Instrumento'} - ${maestro?.nombre || 'Prof'}`
    };
  });
};

// Escuchar cambios en CUALQUIERA de las props (por si llegan en diferentes tiempos)
watch([() => props.horarios, () => props.maestros, () => props.clases], () => {
  construirCalendario();
}, { deep: true });

// Forzar la ejecución al cargar el componente
import { onMounted } from 'vue';
onMounted(() => {
  construirCalendario();
});

// Funciones
function openOptions(day, slot) {
  selectedSlot.value = `${day}-${slot}`
  showOptions.value = true
}
function closeOptions() {
  showOptions.value = false
}

async function procesarYConfirmar() {
  message.value = "Procesando...";

  let maestroId = selectedMaestro.value;
  console.log('Maestro seleccionado:', selectedMaestro.value);
  let alumnoId = selectedAlumno.value;
  console.log('Alumno seleccionado:', selectedAlumno.value);
  let claseId = selectedClase.value;
  console.log('Clase seleccionada:', selectedClase.value);

  // 1. Si es un maestro nuevo, lo creamos primero
  if (maestroId === 'nuevo') {
    const res = await props.onCrearRecurso('profesores', { 
      nombre: nuevoNombreMaestro.value, 
      especialidad: nuevaEspecialidad.value 
    });
    if (res) maestroId = res.id;
  }

  // 2. Si es un alumno nuevo
  if (alumnoId === 'nuevo') {
    const res = await props.onCrearRecurso('alumnos', { 
      nombre: nuevoNombreAlumno.value,
      edad: 10 // O puedes agregar un input de edad
    });
    if (res) alumnoId = res.id;
  }

  // 3. Si es una clase nueva
  if (claseId === 'nuevo') {
    const res = await props.onCrearRecurso('clases', { 
      nombre: nuevoNombreClase.value,
      descripcion: "Nueva clase agregada desde calendario"
    });
    if (res) claseId = res.id;
  }

  // 4. Finalmente, con todos los IDs reales, creamos el horario
  if (maestroId && alumnoId && claseId) {
    const [dia, hora] = selectedSlot.value.split("-");
    const [h, m] = hora.split(':').map(Number);
    const fin = new Date(0, 0, 0, h, m + 45).toTimeString().slice(0, 5);

    try {
      // Esperar a que se agregue la clase
      await agregarClase({
        dia_semana: dia,
        hora_inicio: hora,
        hora_fin: fin,
        profesor_id: maestroId,
        alumno_id: alumnoId,
        clase_id: claseId
      });

      // Limpiar campos y cerrar solo si todo salió bien
      resetCamposNuevos();
      closeOptions();
    } catch (error) {
      console.error("Error al agregar clase:", error);
      message.value = "⚠️ Error al guardar la clase en el horario.";
    }
  } else {
    message.value = "⚠️ Error al crear los nuevos registros.";
  }
}

function resetCamposNuevos() {
  nuevoNombreMaestro.value = "";
  nuevaEspecialidad.value = "";
  nuevoNombreAlumno.value = "";
  nuevoNombreClase.value = "";
}

function removeClass() {
  const claseAsignada = calendar[selectedSlot.value]
  if (claseAsignada && claseAsignada.id) {
    // Enviamos el ID real de la base de datos al padre
    emit("eliminar-clase", claseAsignada.id)
    closeOptions()
  }
}

async function confirmarClase() {
  console.log('🔘 Botón confirmar presionado');
  console.log('📊 Valores seleccionados:', {
    maestro: selectedMaestro.value,
    alumno: selectedAlumno.value,
    clase: selectedClase.value,
    slot: selectedSlot.value
  });
  
  if (!selectedMaestro.value || !selectedAlumno.value || !selectedClase.value) {
    console.log('❌ Campos incompletos');
    message.value = "⚠️ Debes seleccionar todos los campos.";
    return;
  }
  
  console.log('✅ Todos los campos completos, procesando...');

  // Extraemos día y hora del slot seleccionado
  const [dia, hora] = selectedSlot.value.split("-");

  // Calculamos hora_fin (45 min después)
  const [h, m] = hora.split(':').map(Number);
  const fin = new Date(0, 0, 0, h, m + 45).toTimeString().slice(0, 5);

  const objetoParaAPI = {
    dia_semana: dia,
    hora_inicio: hora,
    hora_fin: fin,
    profesor_id: selectedMaestro.value, // Cambiado de maestro_id
    alumno_id: selectedAlumno.value,
    clase_id: selectedClase.value
  };

  try {
    await agregarClase(objetoParaAPI);
    closeOptions();
  } catch (error) {
    console.error("Error al guardar horario:", error);
    message.value = "⚠️ Error al guardar el horario";
  }
}

async function agregarClase(nuevaClase) {
  try {
    console.log('📤 Enviando clase al servidor:', nuevaClase);
    
    const res = await fetch("http://localhost:3000/horarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaClase)
    });
    
    console.log('📥 Respuesta del servidor:', res.status, res.statusText);

    const data = await res.json();

    if (!res.ok) {
      // Si la API devuelve 400 o 409, lanzamos el error
      alert("Error: " + (data.error || "No se pudo guardar"));
      return;
    }

    // Si todo salió bien, actualizamos la lista local
    horarios.value.push(data);
    alert("✅ Clase guardada en la base de datos");
  } catch (error) {
    console.error("Error de red:", error);
    alert("No se pudo conectar con el servidor.");
  }
}

async function eliminarClase(id) {
  try {
    const res = await fetch(`http://localhost:3000/horarios/${id}`, {
      method: "DELETE"
    })

    if (res.ok) {
      // Filtramos el array local para que Vue reaccione y borre la celda
      horarios.value = horarios.value.filter(h => h.id !== id)
      console.log(`Horario ${id} eliminado correctamente`)
    } else {
      alert("No se pudo eliminar de la base de datos")
    }
  } catch (error) {
    console.error("Error al eliminar:", error)
  }
}

</script>

<style scoped>
.container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  flex: 1 1 300px;
}
.calendario {
  flex: 2 1 600px;
}
.asignadas {
  flex: 1 1 300px;
  background: #f9f9f9;
}
.clases {
  flex: 1 1 300px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  cursor: pointer;
}
th {
  background: #2c3e50;
  color: #fff;
}
td {
  background: #ecf0f1;
}
td:empty {
  background: #fff;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  background: #ecf0f1;
  margin: 5px 0;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}
li:hover {
  background: #3498db;
  color: #fff;
}
/* Modal */
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
}
button {
  margin: 5px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #3498;
  color : #fff;
}

.btn-danger:hover {
  background: #800;
  color: #fff;
}

.nuevo-input {
  background: #f0f7ff;
  padding: 10px;
  border-left: 4px solid #3498db;
  margin: 5px 0 15px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.nuevo-input input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
