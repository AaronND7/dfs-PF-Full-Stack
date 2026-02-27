// backend/src/app-simple.js - Versión mínima para debugging
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Ruta básica de prueba
app.get("/", (req, res) => res.json({ status: "API running 🎵" }));

// Ruta de autenticación simple
app.get("/auth/google", (req, res) => {
  console.log('🔍 Accediendo a /auth/google - Ruta encontrada');
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
  
  if (!clientId) {
    console.error('❌ GOOGLE_CLIENT_ID no configurado');
    return res.status(500).json({ error: 'Configuración de Google OAuth incompleta' });
  }
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=profile email&` +
    `access_type=offline`;
  
  console.log('🔗 Redirigiendo a Google OAuth:', authUrl);
  res.redirect(authUrl);
});

// Callback de Google
app.get("/auth/google/callback", async (req, res) => {
  console.log('🔍 Callback de Google recibido');
  console.log('📍 Query params:', req.query);
  
  const { code, error } = req.query;
  
  if (error) {
    console.error('❌ Error en callback de Google:', error);
    return res.redirect(`http://localhost:5174?auth=${encodeURIComponent(JSON.stringify({error: 'Error de autenticación: ' + error}))}`);
  }
  
  if (!code) {
    console.error('❌ No se recibió código de autorización');
    return res.redirect(`http://localhost:5174?auth=${encodeURIComponent(JSON.stringify({error: 'No se recibió código de autorización'}))}`);
  }
  
  try {
    // Usuario demo por ahora
    const userData = {
      user: {
        id: '123456789',
        displayName: 'Usuario Demo',
        email: 'demo@example.com',
        photo: 'https://via.placeholder.com/50',
        provider: 'google'
      },
      message: "Autenticación exitosa (Demo)"
    };
    
    console.log('✅ Usuario autenticado:', userData.user);
    res.redirect(`http://localhost:5174?auth=${encodeURIComponent(JSON.stringify(userData))}`);
    
  } catch (error) {
    console.error('❌ Error procesando callback:', error);
    res.redirect(`http://localhost:5174?auth=${encodeURIComponent(JSON.stringify({error: 'Error procesando autenticación'}))}`);
  }
});

// Rutas de la API (básicas)
app.get("/horarios", (req, res) => res.json([]));
app.get("/clases", (req, res) => res.json([]));
app.get("/alumnos", (req, res) => res.json([]));
app.get("/profesores", (req, res) => res.json([]));

// API de clima
app.get("/weather/current/:city", (req, res) => {
  const city = req.params.city;
  res.json({
    city: city,
    country: "MX",
    temperature: 25,
    description: "cielo despejado",
    icon: "01d",
    humidity: 60,
    windSpeed: 3.5
  });
});

module.exports = app;
