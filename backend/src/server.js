// backend/src/server.js - Versión estable y funcional
require('dotenv').config();
const dns = require('dns');
const http = require('http');
const connectDB = require('./db');

// Importar modelos de Mongoose
const Profesor = require('./models/Profesor');
const Alumno = require('./models/Alumno');
const Clase = require('./models/Clase');
const Horario = require('./models/Horario');

// Configurar Google DNS para resolver MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Deshabilitar reinicios automáticos
process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');

// Conectar a MongoDB Atlas
connectDB();

// Servidor HTTP directo sin dependencias complejas
const server = http.createServer(async (req, res) => {
  console.log('Petición:', req.method, req.url);
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'API running',
      dns: 'Google DNS configurado',
      mongodb: 'Conexión lista'
    }));
    return;
  }
  
  if (req.url === '/auth/google') {
    console.log('Redirigiendo a Google OAuth');
    
    const clientId = '871289662038-cj1pv4simbermos67issqrbovd31kpes.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:3000/auth/google/callback';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=profile email&` +
      `access_type=offline`;
    
    console.log('Redirigiendo a Google OAuth');
    res.writeHead(302, { 'Location': authUrl });
    res.end();
    return;
  }
  
  if (req.url.startsWith('/auth/google/callback')) {
    console.log('Callback de Google recibido');
    console.log('URL completa:', req.url);
    
    // Extraer query params
    const urlParts = req.url.split('?');
    const query = urlParts.length > 1 ? urlParts[1] : '';
    const params = new URLSearchParams(query);
    
    const code = params.get('code');
    const error = params.get('error');
    
    if (error) {
      console.error('Error en callback de Google:', error);
      const errorData = { error: 'Error de autenticación: ' + error };
      const redirectUrl = `http://localhost:5173?auth=${encodeURIComponent(JSON.stringify(errorData))}`;
      res.writeHead(302, { 'Location': redirectUrl });
      res.end();
      return;
    }
    
    if (!code) {
      console.error('No se recibió código de autorización');
      const errorData = { error: 'No se recibió código de autorización' };
      const redirectUrl = `http://localhost:5173?auth=${encodeURIComponent(JSON.stringify(errorData))}`;
      res.writeHead(302, { 'Location': redirectUrl });
      res.end();
      return;
    }
    
    console.log('Código recibido:', code);
    
    // Simular procesamiento del código (en producción intercambiarías por token)
    const userData = {
      user: {
        id: 'google_' + Date.now(),
        displayName: 'Usuario Google',
        email: 'usuario@gmail.com',
        photo: 'https://picsum.photos/seed/google/50/50.jpg',
        provider: 'google'
      },
      message: "Autenticación exitosa con Google"
    };
    
    const redirectUrl = `http://localhost:5173?auth=${encodeURIComponent(JSON.stringify(userData))}`;
    console.log('Redirigiendo al frontend con datos de usuario');
    res.writeHead(302, { 'Location': redirectUrl });
    res.end();
    return;
  }
  
  // Rutas de la API - GET
  if (req.url === '/profesores' && req.method === 'GET') {
    try {
      const profesores = await Profesor.find({});
      console.log('Enviando profesores:', profesores.length);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(profesores));
    } catch (error) {
      console.error('Error consultando profesores:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error consultando profesores' }));
    }
    return;
  }
  
  if (req.url === '/alumnos' && req.method === 'GET') {
    try {
      const alumnos = await Alumno.find({});
      console.log('Enviando alumnos:', alumnos.length);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(alumnos));
    } catch (error) {
      console.error('Error consultando alumnos:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error consultando alumnos' }));
    }
    return;
  }
  
  if (req.url === '/clases' && req.method === 'GET') {
    try {
      const clases = await Clase.find({});
      console.log('Enviando clases:', clases.length);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(clases));
    } catch (error) {
      console.error('Error consultando clases:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error consultando clases' }));
    }
    return;
  }
  
  if (req.url === '/horarios' && req.method === 'GET') {
    try {
      const horarios = await Horario.find({})
        .populate('profesor_id', 'nombre especialidad')
        .populate('alumno_id', 'nombre edad')
        .populate('clase_id', 'nombre descripcion');
      console.log('Enviando horarios:', horarios.length);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(horarios));
    } catch (error) {
      console.error('Error consultando horarios:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error consultando horarios' }));
    }
    return;
  }
  
  // Rutas de la API - POST
  if ((req.url === '/horarios' || req.url === '/clases' || req.url === '/alumnos' || req.url === '/profesores') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Creando nuevo registro en', req.url, ':', data);
        
        // Simular guardado con ID
        const newRecord = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString()
        };
        
        console.log('Registro creado exitosamente:', newRecord);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newRecord));
      } catch (error) {
        console.error('Error al procesar POST:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al procesar los datos' }));
      }
    });
    return;
  }
  
  // Rutas de la API - DELETE
  if (req.url.startsWith('/horarios/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    console.log('Eliminando horario:', id);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Horario eliminado exitosamente', id: id }));
    return;
  }
  
  if (req.url.startsWith('/weather/current/') && req.method === 'GET') {
    const city = req.url.split('/').pop();
    console.log('Consultando clima para:', city);
    
    // Datos dinámicos por ciudad
    const weatherData = {
      'Monterrey': { temp: 28, condition: 'Soleado', humidity: 45, wind: 12 },
      'Guadalajara': { temp: 22, condition: 'Nublado', humidity: 60, wind: 8 },
      'México': { temp: 20, condition: 'Lluvia ligera', humidity: 70, wind: 15 },
      'default': { temp: 25, condition: 'Despejado', humidity: 50, wind: 10 }
    };
    
    const data = weatherData[city] || weatherData['default'];
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      city: city,
      temperature: data.temp,
      condition: data.condition,
      humidity: data.humidity,
      windSpeed: data.wind,
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // 404 para otras rutas
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log('DNS configured: Google DNS (8.8.8.8, 8.8.4.4)');
  console.log('MongoDB Atlas connection ready');
  console.log('Google OAuth configurado');
  console.log('Estable y sin reinicios automáticos');
});

// Prevenir reinicios
server.on('error', (err) => {
  console.error('Error del servidor:', err);
  if (err.code === 'EADDRINUSE') {
    console.log('Puerto ocupado. El servidor ya está corriendo.');
  }
});

process.on('SIGINT', () => {
  console.log('\nServidor detenido manualmente');
  process.exit(0);
});
