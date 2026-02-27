// backend/src/test-deep.js - Diagnóstico profundo
require('dotenv').config();

console.log('🔍 Diagnóstico profundo - IP abierta para todos');
console.log('📍 URI:', process.env.MONGODB_URI);

// 1. Verificar si el cluster existe realmente
const dns = require('dns');
const https = require('https');

function checkClusterExistence() {
  console.log('\n🌐 Paso 1: Verificando existencia del cluster...');
  
  const hostname = 'escuela.rdt4jqq.mongodb.net';
  
  // Intentar diferentes métodos DNS
  const methods = [
    { name: 'lookup', fn: dns.lookup },
    { name: 'resolve', fn: dns.resolve },
    { name: 'resolve4', fn: dns.resolve4 },
    { name: 'resolve6', fn: dns.resolve6 }
  ];
  
  methods.forEach(({ name, fn }) => {
    fn.call(dns, hostname, (err, result) => {
      if (err) {
        console.log(`❌ ${name}: ${err.message}`);
      } else {
        console.log(`✅ ${name}: ${JSON.stringify(result)}`);
      }
    });
  });
}

// 2. Probar conexión HTTPS directa
function testHTTPSConnection() {
  console.log('\n🔒 Paso 2: Probando conexión HTTPS directa...');
  
  const options = {
    hostname: 'escuela.rdt4jqq.mongodb.net',
    port: 443,
    path: '/',
    method: 'HEAD',
    timeout: 5000
  };
  
  const req = https.request(options, (res) => {
    console.log(`✅ HTTPS Response: ${res.statusCode}`);
    console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
  });
  
  req.on('error', (e) => {
    console.error(`❌ HTTPS Error: ${e.message}`);
    
    if (e.message.includes('ENOTFOUND')) {
      console.log('🔍 El nombre del cluster no existe');
    } else if (e.message.includes('ECONNREFUSED')) {
      console.log('🔍 El servidor rechaza la conexión');
    } else if (e.message.includes('TIMEOUT')) {
      console.log('🔍 El servidor no responde');
    }
  });
  
  req.on('timeout', () => {
    console.error('❌ HTTPS Timeout');
    req.destroy();
  });
  
  req.end();
}

// 3. Probar con diferentes credenciales
async function testDifferentCredentials() {
  console.log('\n🔐 Paso 3: Probando con diferentes credenciales...');
  
  const mongoose = require('mongoose');
  
  const testConfigs = [
    {
      name: 'Credenciales originales',
      uri: 'mongodb+srv://sudo_cesar:emanuel777@escuela.rdt4jqq.mongodb.net'
    },
    {
      name: 'Sin contraseña',
      uri: 'mongodb+srv://sudo_cesar@escuela.rdt4jqq.mongodb.net'
    },
    {
      name: 'Usuario admin genérico',
      uri: 'mongodb+srv://admin:admin@escuela.rdt4jqq.mongodb.net'
    }
  ];
  
  for (const config of testConfigs) {
    try {
      console.log(`🔄 Probando: ${config.name}`);
      await mongoose.connect(config.uri, { 
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      console.log(`✅ ${config.name}: Conexión exitosa`);
      await mongoose.connection.close();
      return config.name;
    } catch (error) {
      console.log(`❌ ${config.name}: ${error.message}`);
    }
  }
  
  return null;
}

// 4. Verificar si es problema de región o servidor
function checkServerStatus() {
  console.log('\n🌍 Paso 4: Verificando estado del servidor...');
  
  // Probar ping a MongoDB Atlas
  const { exec } = require('child_process');
  
  exec('ping mongodb.com -n 2', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ No se puede hacer ping a mongodb.com');
    } else {
      console.log('✅ Ping a mongodb.com exitoso');
      console.log('📋 Conexión a internet funciona');
    }
  });
}

// Ejecutar diagnóstico
async function runDeepDiagnosis() {
  checkClusterExistence();
  testHTTPSConnection();
  checkServerStatus();
  
  const credentialsResult = await testDifferentCredentials();
  
  setTimeout(() => {
    console.log('\n📋 Resumen del diagnóstico:');
    console.log('🔍 Si todos los métodos DNS fallan, el cluster no existe');
    console.log('🔍 Si HTTPS falla, el servidor no está accesible');
    console.log('🔍 Si ninguna credencial funciona, el usuario/contraseña es incorrecto');
    
    if (credentialsResult) {
      console.log(`✅ Solución encontrada: ${credentialsResult}`);
    } else {
      console.log('❌ No se encontró solución - Verifica el nombre del cluster');
    }
  }, 3000);
}

runDeepDiagnosis();
