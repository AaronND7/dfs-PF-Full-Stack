// Backend con API del clima corregida - Sin dependencia de base de datos
const http = require('http');

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
  
  // Ruta del clima dinámico
  if (req.url.startsWith('/weather/current/') && req.method === 'GET') {
    const city = req.url.split('/').pop();
    console.log('Consultando clima para:', city);
    
    // Datos dinámicos por ciudad
    const weatherData = {
      'Monterrey': { temp: 28, condition: 'Soleado', humidity: 45, wind: 12, icon: '01d' },
      'Guadalajara': { temp: 22, condition: 'Nublado', humidity: 60, wind: 8, icon: '03d' },
      'México': { temp: 20, condition: 'Lluvia ligera', humidity: 70, wind: 15, icon: '10d' },
      'default': { temp: 25, condition: 'Despejado', humidity: 50, wind: 10, icon: '01d' }
    };
    
    const data = weatherData[city] || weatherData['default'];
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      city: city,
      country: "MX",
      temperature: data.temp,
      condition: data.condition,
      description: data.condition,
      icon: data.icon,
      humidity: data.humidity,
      windSpeed: data.wind,
      timestamp: new Date().toISOString()
    }));
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
