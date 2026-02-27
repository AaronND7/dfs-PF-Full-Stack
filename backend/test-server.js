// Servidor ultra-simple para prueba inmediata
const express = require('express');
const app = express();

app.use(cors());

// Ruta principal
app.get('/', (req, res) => {
  res.json({ status: 'API running 🎵' });
});

// Ruta de Google OAuth
app.get('/auth/google', (req, res) => {
  console.log('🔍 Accediendo a /auth/google');
  
  const clientId = '871289662038-cj1pv4simbermos67issqrbovd31kpes.apps.googleusercontent.com';
  const redirectUri = 'http://localhost:3000/auth/google/callback';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=profile email&` +
    `access_type=offline`;
  
  console.log('🔗 Redirigiendo a Google');
  res.redirect(authUrl);
});

// Callback de Google
app.get('/auth/google/callback', (req, res) => {
  console.log('🔍 Callback recibido');
  
  const userData = {
    user: {
      id: '123456789',
      displayName: 'Usuario Demo',
      email: 'demo@example.com',
      photo: 'https://via.placeholder.com/50',
      provider: 'google'
    },
    message: "Autenticación exitosa"
  };
  
  res.redirect(`http://localhost:5174?auth=${encodeURIComponent(JSON.stringify(userData))}`);
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR CORRIENDO en http://localhost:${PORT}`);
  console.log('✅ Ruta /auth/google disponible');
});
