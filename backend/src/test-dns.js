// backend/src/test-dns.js - Prueba de DNS alternativo
const dns = require('dns');

console.log('🔍 Probando diferentes métodos DNS...');

// Método 1: DNS estándar
dns.lookup('clustermusicschool.qxmtdiu.mongodb.net', (err, address, family) => {
  if (err) {
    console.log('❌ DNS lookup falló:', err.message);
  } else {
    console.log('✅ DNS lookup exitoso:', address);
  }
});

// Método 2: DNS resolution
dns.resolve('clustermusicschool.qxmtdiu.mongodb.net', (err, addresses) => {
  if (err) {
    console.log('❌ DNS resolve falló:', err.message);
  } else {
    console.log('✅ DNS resolve exitoso:', addresses);
  }
});

// Método 3: Probar con Google DNS
console.log('\n🌐 Probando con Google DNS (8.8.8.8)...');
const { Resolver } = require('dns');
const resolver = new Resolver();
resolver.setServers(['8.8.8.8']);

resolver.resolve4('clustermusicschool.qxmtdiu.mongodb.net', (err, addresses) => {
  if (err) {
    console.log('❌ Google DNS falló:', err.message);
  } else {
    console.log('✅ Google DNS exitoso:', addresses);
  }
});

// Método 4: Probar ping básico
const { exec } = require('child_process');

console.log('\n📡 Probando ping...');
exec('ping clustermusicschool.qxmtdiu.mongodb.net -n 2', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Ping falló:', error.message);
  } else {
    console.log('✅ Ping exitoso');
    console.log(stdout);
  }
});
