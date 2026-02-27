// Servidor solución final - Puerto 3002 pero callback en 3000
console.log('Iniciando servidor solución final...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Petición:', req.method, req.url);
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'API running 🎵 - Puerto 3002' }));
    return;
  }
  
  if (req.url === '/auth/google') {
    console.log('🔍 Redirigiendo a Google OAuth');
    
    const clientId = '871289662038-cj1pv4simbermos67issqrbovd31kpes.apps.googleusercontent.com';
    // IMPORTANTE: Usamos localhost:3000 en el callback porque Google tiene esa URL configurada
    const redirectUri = 'http://localhost:3000/auth/google/callback';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=profile email&` +
      `access_type=offline`;
    
    console.log('🔗 URL de autenticación:', authUrl);
    console.log('📍 Callback configurado para:', redirectUri);
    res.writeHead(302, { 'Location': authUrl });
    res.end();
    return;
  }
  
  if (req.url.startsWith('/auth/google/callback')) {
    console.log('🔍 Callback de Google recibido');
    console.log('📍 Query params:', req.url.split('?')[1]);
    
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
    
    const redirectUrl = `http://localhost:5174?auth=${encodeURIComponent(JSON.stringify(userData))}`;
    res.writeHead(302, { 'Location': redirectUrl });
    res.end();
    return;
  }
  
  // Rutas por defecto para la app
  if (req.url === '/horarios' || req.url === '/clases' || req.url === '/alumnos' || req.url === '/profesores') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
    return;
  }
  
  if (req.url.startsWith('/weather/current/')) {
    const city = req.url.split('/').pop();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      city: city,
      country: "MX",
      temperature: 25,
      description: "cielo despejado",
      icon: "01d",
      humidity: 60,
      windSpeed: 3.5
    }));
    return;
  }
  
  // 404 para otras rutas
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`🚀 SERVIDOR INICIADO en http://localhost:${PORT}`);
  console.log('✅ Ruta /auth/google disponible');
  console.log('🔗 URL de callback: http://localhost:3000/auth/google/callback');
  console.log('📝 NOTA: Google tiene configurado el callback en puerto 3000');
  console.log('🌐 Frontend debe apuntar a puerto 3002 para las API');
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err);
});
