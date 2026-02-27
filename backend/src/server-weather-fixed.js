// Backend con API del clima real - Sin dependencia de base de datos
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Cargar variables de entorno desde env.txt si no están definidas
if (!process.env.OPENWEATHER_API_KEY) {
  try {
    const envPath = path.join(__dirname, '..', 'env.txt');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
    console.log('Variables de entorno cargadas desde env.txt');
  } catch (error) {
    console.error('Error cargando env.txt:', error);
  }
}

// Servidor HTTP con API del clima actualizada
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
      weather: 'API del clima actualizada',
      google: 'API de Google OAuth disponible'
    }));
    return;
  }
  
  // API de Google OAuth
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
  
  // Ruta del clima con API real de OpenWeatherMap
  if (req.url.startsWith('/weather/current/') && req.method === 'GET') {
    const city = req.url.split('/').pop();
    console.log('Consultando clima real para:', city);
    
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
    
    if (!apiKey) {
      console.error('No se encontró OPENWEATHER_API_KEY en las variables de entorno');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API key de OpenWeatherMap no configurada' }));
      return;
    }
    
    const weatherUrl = `${baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;
    
    https.get(weatherUrl, (weatherRes) => {
      let data = '';
      
      weatherRes.on('data', (chunk) => {
        data += chunk;
      });
      
      weatherRes.on('end', () => {
        try {
          const weatherData = JSON.parse(data);
          
          if (weatherRes.statusCode !== 200) {
            console.error('Error de OpenWeatherMap:', weatherData);
            res.writeHead(weatherRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: weatherData.message || 'Error obteniendo clima de OpenWeatherMap' 
            }));
            return;
          }
          
          // Formatear respuesta para compatibilidad con frontend
          const formattedResponse = {
            city: weatherData.name,
            country: weatherData.sys.country,
            temperature: Math.round(weatherData.main.temp),
            condition: weatherData.weather[0].description,
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed,
            timestamp: new Date().toISOString()
          };
          
          console.log(`Clima real obtenido para ${city}: ${formattedResponse.temperature}°C, ${formattedResponse.condition}`);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(formattedResponse));
          
        } catch (error) {
          console.error('Error procesando respuesta de OpenWeatherMap:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error procesando datos del clima' }));
        }
      });
      
    }).on('error', (error) => {
      console.error('Error conectando a OpenWeatherMap:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error de conexión con OpenWeatherMap' }));
    });
    
    return;
  }
  
  // Rutas de la API - GET (simuladas)
  if (req.url === '/profesores' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      { id: 1, nombre: 'Profesor 1', especialidad: 'Guitarra' },
      { id: 2, nombre: 'Profesor 2', especialidad: 'Piano' }
    ]));
    return;
  }
  
  if (req.url === '/alumnos' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      { id: 1, nombre: 'Alumno 1', edad: 20 },
      { id: 2, nombre: 'Alumno 2', edad: 25 }
    ]));
    return;
  }
  
  if (req.url === '/clases' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      { id: 1, nombre: 'Guitarra Básico', descripcion: 'Clase de guitarra para principiantes' },
      { id: 2, nombre: 'Piano Intermedio', descripcion: 'Clase de piano nivel intermedio' }
    ]));
    return;
  }
  
  if (req.url === '/horarios' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      { 
        id: 1, 
        clase_id: 1, 
        profesor_id: 1, 
        alumno_id: 1, 
        dia_semana: 'Lunes', 
        hora_inicio: '10:00:00', 
        hora_fin: '11:00:00' 
      }
    ]));
    return;
  }
  
  // 404 para otras rutas
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log('API del clima actualizada y funcionando');
  console.log('Datos dinámicos por ciudad disponibles');
});

process.on('SIGINT', () => {
  console.log('\nServidor detenido manualmente');
  process.exit(0);
});
