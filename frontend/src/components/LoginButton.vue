<template>
  <div class="login-button-container">
    <button @click="handleGoogleLogin" class="google-login-btn" :disabled="loading">
      <svg v-if="!loading" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span v-if="loading">Cargando...</span>
      <span v-else>Iniciar sesión con Google</span>
    </button>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const error = ref('')
const emit = defineEmits(['login-success'])

// Procesar el callback de autenticación al montar el componente
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const authData = urlParams.get('auth')
  
  if (authData) {
    try {
      const userData = JSON.parse(decodeURIComponent(authData))
      if (userData.user) {
        emit('login-success', userData)
        // Limpiar la URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } else if (userData.error) {
        error.value = userData.error
      }
    } catch (e) {
      error.value = 'Error procesando la respuesta de autenticación'
    }
  }
})

const handleGoogleLogin = () => {
  loading.value = true
  error.value = ''
  
  try {
    // Redirigir al backend para iniciar el flujo de autenticación con Google
    window.location.href = 'http://localhost:3000/auth/google'
  } catch (err) {
    error.value = 'Error al iniciar sesión con Google'
    loading.value = false
  }
}
</script>

<style scoped>
.login-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.google-login-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #dadce0;
  color: #3c4043;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

.google-login-btn:hover:not(:disabled) {
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

.google-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-login-btn svg {
  color: #4285f4;
}

.error-message {
  color: #d93025;
  font-size: 14px;
  text-align: center;
  padding: 10px;
  background: #fce8e6;
  border: 1px solid #d93025;
  border-radius: 4px;
  max-width: 300px;
}
</style>
