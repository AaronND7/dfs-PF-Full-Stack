// backend/src/test-final-check.js - Verificación final
require('dotenv').config();

console.log('🔍 Verificación final del cluster...');
console.log('📍 URI:', process.env.MONGODB_URI);

// Extraer el nombre del host
const uri = process.env.MONGODB_URI;
const match = uri.match(/@([^/?]+)/);
const hostname = match ? match[1] : null;

console.log('🌐 Hostname extraído:', hostname);

if (!hostname) {
  console.error('❌ No se pudo extraer el hostname');
  process.exit(1);
}

// Probar diferentes métodos de resolución
const dns = require('dns');

console.log('\n🔍 Métodos de resolución DNS:');

// Método 1: lookup
dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.log(`❌ lookup: ${err.message}`);
  } else {
    console.log(`✅ lookup: ${address} (IPv${family})`);
  }
});

// Método 2: resolve
dns.resolve(hostname, (err, addresses) => {
  if (err) {
    console.log(`❌ resolve: ${err.message}`);
  } else {
    console.log(`✅ resolve: ${addresses.join(', ')}`);
  }
});

// Método 3: resolveAny
dns.resolveAny(hostname, (err, records) => {
  if (err) {
    console.log(`❌ resolveAny: ${err.message}`);
  } else {
    console.log(`✅ resolveAny: ${JSON.stringify(records, null, 2)}`);
  }
});

// Método 4: Probar con SRV específico de MongoDB
const srvRecord = `_mongodb._tcp.${hostname}`;
dns.resolveSrv(srvRecord, (err, records) => {
  if (err) {
    console.log(`❌ SRV (${srvRecord}): ${err.message}`);
    console.log('🔍 ESTE ES EL ERROR CLAVE - SRV no responde');
  } else {
    console.log(`✅ SRV (${srvRecord}): ${JSON.stringify(records, null, 2)}`);
  }
});

// Método 5: Probar con TXT
dns.resolveTxt(hostname, (err, records) => {
  if (err) {
    console.log(`❌ TXT: ${err.message}`);
  } else {
    console.log(`✅ TXT: ${JSON.stringify(records, null, 2)}`);
  }
});

// Resumen
setTimeout(() => {
  console.log('\n📋 Resumen:');
  console.log('🔍 Si SRV falla, el cluster no existe o está paused');
  console.log('🔍 Si lookup falla, el nombre no existe en DNS');
  console.log('🔍 Si todos fallan, el cluster no está accesible');
  
  console.log('\n🎯 Acciones recomendadas:');
  console.log('1. Verificar que el cluster esté "Running" en MongoDB Atlas');
  console.log('2. Verificar Network Access settings');
  console.log('3. Obtener una URI fresca desde MongoDB Atlas');
}, 2000);
