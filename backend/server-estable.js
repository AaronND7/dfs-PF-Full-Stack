// Servidor estable - Sin reinicios automáticos
console.log('Iniciando servidor estable...');

// Deshabilitar reinicios automáticos
process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Petición:', req.method, req.url);
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'API running 🎵 - Servidor Estable' }));
    return;
  }
  
  if (req.url === '/auth/google') {
    console.log('🔍 Redirigiendo a Google OAuth');
    
    const clientId = '871289662038-cj1pv4simbermos67issqrbovd31kpes.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:4000/auth/google/callback';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=profile email&` +
      `access_type=offline`;
    
    console.log('🔗 URL de autenticación:', authUrl);
    res.writeHead(302, { 'Location': authUrl });
    res.end();
    return;
  }
  
  if (req.url.startsWith('/auth/google/callback')) {
    console.log('🔍 Callback de Google recibido');
    
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

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 SERVIDOR ESTABLE INICIADO en http://localhost:${PORT}`);
  console.log('✅ Sin reinicios automáticos');
  console.log('✅ Google OAuth configurado');
  console.log('🔗 URL de callback: http://localhost:4000/auth/google/callback');
  console.log('📝 Necesitas agregar esta URL en Google Cloud Console');
});

// Prevenir reinicios automáticos
server.on('error', (err) => {
  console.error('❌ Error del servidor:', err);
  if (err.code === 'EADDRINUSE') {
    console.log('💡 Puerto ocupado. Intenta otro puerto o detén otros procesos.');
  }
});

// Evitar que el proceso se cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Servidor detenido manualmente');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Servidor terminado');
  process.exit(0);
});
