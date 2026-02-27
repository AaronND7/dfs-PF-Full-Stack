// backend/src/test-manual.js - Prueba manual y verificación
require('dotenv').config();

console.log('🔍 Prueba manual de la URI...');
console.log('📍 URI:', process.env.MONGODB_URI);

// 1. Verificar que la URI esté bien formada
const uri = process.env.MONGODB_URI;
console.log('\n📋 Análisis de la URI:');
console.log('✅ Inicia con mongodb+srv://:', uri.startsWith('mongodb+srv://'));
console.log('✅ Contiene @:', uri.includes('@'));
console.log('✅ Termina con .mongodb.net:', uri.includes('.mongodb.net'));

// 2. Extraer componentes
const cleanURI = uri.replace('mongodb+srv://', '');
const [credentials, hostPart] = cleanURI.split('@');
const [host, ...params] = hostPart.split('?');

console.log('\n👤 Credenciales:');
console.log('Usuario:', credentials.split(':')[0]);
console.log('Contraseña:', credentials.split(':')[1] ? '***' : 'NO ENCONTRADA');

console.log('\n🌐 Host:', host);
console.log('📋 Parámetros:', params.length > 0 ? params.join('?') : 'SIN PARÁMETROS');

// 3. Probar DNS manualmente
const dns = require('dns');

console.log('\n🔍 Pruebas DNS manuales:');

// Probar resolución directa del host
dns.lookup(host, (err, address, family) => {
  if (err) {
    console.log(`❌ DNS lookup (${host}): ${err.message}`);
  } else {
    console.log(`✅ DNS lookup (${host}): ${address} (IPv${family})`);
  }
});

// Probar SRV record
const srvRecord = `_mongodb._tcp.${host}`;
dns.resolveSrv(srvRecord, (err, records) => {
  if (err) {
    console.log(`❌ SRV (${srvRecord}): ${err.message}`);
    console.log('🔍 ESTE ES EL PROBLEMA - SRV no responde');
  } else {
    console.log(`✅ SRV (${srvRecord}): ${JSON.stringify(records, null, 2)}`);
  }
});

// 4. Probar conexión HTTP básica
console.log('\n🔒 Prueba de conexión HTTP...');
const https = require('https');

const options = {
  hostname: host,
  port: 443,
  path: '/',
  method: 'HEAD',
  timeout: 5000
};

const req = https.request(options, (res) => {
  console.log(`✅ HTTP Response: ${res.statusCode}`);
  console.log(`📋 Server: ${res.headers.server}`);
});

req.on('error', (e) => {
  console.error(`❌ HTTP Error: ${e.message}`);
});

req.on('timeout', () => {
  console.error('❌ HTTP Timeout');
  req.destroy();
});

req.end();

// 5. Verificación final
setTimeout(() => {
  console.log('\n🎯 Verificación final:');
  console.log('🔍 Si SRV falla, el cluster no existe o no está configurado correctamente');
  console.log('🔍 Si HTTP falla, el servidor no es accesible');
  console.log('🔍 Si DNS lookup falla, el nombre no existe');
  
  console.log('\n💡 Recomendaciones:');
  console.log('1. Verifica que la URI sea EXACTAMENTE como la da MongoDB Atlas');
  console.log('2. Copia la URI directamente desde MongoDB Atlas sin modificar');
  console.log('3. Verifica que no haya espacios extraños o caracteres especiales');
  console.log('4. Intenta desde una red diferente o conexión');
  
  console.log('\n🔧 Para depurar:');
  console.log('- Abre MongoDB Atlas en tu navegador');
  console.log('- Ve a "Clusters" → "Connect" → "Connect your application"');
  console.log('- Copia la URI y pégala aquí sin cambios');
}, 3000);
