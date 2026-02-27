<template>
  <div class="weather-widget">
    <div v-if="loading" class="loading">
      Cargando clima...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="weather" class="weather-info">
      <div class="weather-header">
        <h3>{{ weather.city }}, {{ weather.country }}</h3>
        <div class="temperature">
          <img 
            :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`" 
            :alt="weather.description"
            class="weather-icon"
          />
          <span class="temp">{{ Math.round(weather.temperature) }}°C</span>
        </div>
        <p class="description">{{ weather.description }}</p>
      </div>
      
      <div class="weather-details">
        <div class="detail">
          <span class="label">Humedad:</span>
          <span class="value">{{ weather.humidity }}%</span>
        </div>
        <div class="detail">
          <span class="label">Viento:</span>
          <span class="value">{{ weather.windSpeed }} m/s</span>
        </div>
      </div>
    </div>
    
    <div class="weather-input">
      <input 
        v-model="cityInput" 
        @keyup.enter="getWeather"
        placeholder="Ingrese ciudad"
        class="city-input"
      />
      <button @click="getWeather" class="search-btn">Buscar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const weather = ref(null)
const loading = ref(false)
const error = ref('')
const cityInput = ref('Monterrey') // Ciudad por defecto

const getWeather = async () => {
  if (!cityInput.value.trim()) {
    error.value = 'Por favor ingrese una ciudad'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`http://localhost:3000/weather/current/${encodeURIComponent(cityInput.value)}`)
    const data = await response.json()
    
    if (response.ok) {
      weather.value = data
    } else {
      error.value = data.error || 'Error al obtener el clima'
    }
  } catch (err) {
    error.value = 'Error de conexión'
    console.error('Error obteniendo clima:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getWeather()
})
</script>

<style scoped>
.weather-widget {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  max-width: 300px;
  margin: 20px auto;
}

.weather-header {
  text-align: center;
  margin-bottom: 20px;
}

.weather-header h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.temperature {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.weather-icon {
  width: 50px;
  height: 50px;
}

.temp {
  font-size: 2em;
  font-weight: bold;
}

.description {
  margin: 0;
  text-transform: capitalize;
  opacity: 0.9;
}

.weather-details {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.detail {
  text-align: center;
}

.label {
  display: block;
  font-size: 0.9em;
  opacity: 0.8;
  margin-bottom: 5px;
}

.value {
  font-weight: bold;
}

.weather-input {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.city-input {
  flex: 1;
  max-width: 200px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 20px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.search-btn:hover {
  background: rgba(255,255,255,0.3);
}

.loading, .error {
  text-align: center;
  padding: 20px;
}

.error {
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.5);
  border-radius: 6px;
}
</style>
