// backend/src/test-basic.js - Prueba básica de conectividad
require('dotenv').config();

console.log('🔍 Diagnóstico de conectividad básica');
console.log('📍 URI:', process.env.MONGODB_URI);

// 1. Probar ping a MongoDB
const https = require('https');

function testDNS() {
  console.log('\n🌐 Paso 1: Probando resolución DNS...');
  
  const dns = require('dns');
  dns.lookup('clustermusicschool.qxmtdiu.mongodb.net', (err, address, family) => {
    if (err) {
      console.error('❌ Error DNS:', err.message);
      return;
    }
    console.log('✅ DNS resuelto:', address, 'IPv' + family);
    testHTTPS();
  });
}

function testHTTPS() {
  console.log('\n🔒 Paso 2: Probando conexión HTTPS...');
  
  const options = {
    hostname: 'clustermusicschool.qxmtdiu.mongodb.net',
    port: 443,
    path: '/',
    method: 'GET'
  };
  
  const req = https.request(options, (res) => {
    console.log('✅ Conexión HTTPS exitosa');
    console.log('📊 Status:', res.statusCode);
    testMongo();
  });
  
  req.on('error', (e) => {
    console.error('❌ Error HTTPS:', e.message);
    console.log('🔍 Posible problema de red o firewall');
  });
  
  req.end();
}

function testMongo() {
  console.log('\n🗄️ Paso 3: Probando conexión MongoDB...');
  
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Conexión MongoDB exitosa');
      console.log('🎯 ¡Todo funciona correctamente!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error MongoDB:', err.message);
      
      // Análisis específico del error
      if (err.message.includes('ENOTFOUND')) {
        console.error('🔍 DNS no encuentra el servidor');
        console.error('💡 Verifica que la URI sea correcta');
      } else if (err.message.includes('ECONNREFUSED')) {
        console.error('🔍 Conexión rechazada');
        console.error('💡 Verifica firewall o proxy');
      } else if (err.message.includes('ENOTFOUND')) {
        console.error('🔍 No se encuentra el servidor');
        console.error('💡 Verifica el nombre del cluster');
      }
      
      process.exit(1);
    });
}

testDNS();
