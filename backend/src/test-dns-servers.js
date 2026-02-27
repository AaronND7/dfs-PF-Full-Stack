// backend/src/test-dns-servers.js - Probar diferentes servidores DNS
const dns = require('dns');

console.log('🔍 Probando diferentes servidores DNS...');

// Servidores DNS para probar
const dnsServers = [
  { name: 'DNS por defecto', servers: [] },
  { name: 'Google DNS', servers: ['8.8.8.8', '8.8.4.4'] },
  { name: 'Cloudflare DNS', servers: ['1.1.1.1', '1.0.0.1'] },
  { name: 'OpenDNS', servers: ['208.67.222.222', '208.67.220.220'] },
  { name: 'Quad9 DNS', servers: ['9.9.9.9', '149.112.112.112'] }
];

const hostname = 'escuela.rdt4jqq.mongodb.net';

async function testWithDNSServer(serverConfig) {
  console.log(`\n🌐 Probando con ${serverConfig.name}...`);
  
  return new Promise((resolve) => {
    // Configurar el servidor DNS
    if (serverConfig.servers.length > 0) {
      dns.setServers(serverConfig.servers);
      console.log(`📍 Servidores DNS: ${serverConfig.servers.join(', ')}`);
    } else {
      console.log('📍 Usando DNS por defecto del sistema');
    }
    
    // Probar lookup
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.log(`❌ lookup: ${err.message}`);
        
        // Probar SRV
        dns.resolveSrv(`_mongodb._tcp.${hostname}`, (srvErr, records) => {
          if (srvErr) {
            console.log(`❌ SRV: ${srvErr.message}`);
            resolve({ server: serverConfig.name, success: false, error: srvErr.message });
          } else {
            console.log(`✅ SRV: ${records.length} records`);
            resolve({ server: serverConfig.name, success: true, records });
          }
        });
      } else {
        console.log(`✅ lookup: ${address} (IPv${family})`);
        
        // Probar SRV también
        dns.resolveSrv(`_mongodb._tcp.${hostname}`, (srvErr, records) => {
          if (srvErr) {
            console.log(`❌ SRV: ${srvErr.message}`);
            resolve({ server: serverConfig.name, success: false, error: srvErr.message });
          } else {
            console.log(`✅ SRV: ${records.length} records`);
            resolve({ server: serverConfig.name, success: true, records, address });
          }
        });
      }
    });
  });
}

async function runDNSTests() {
  console.log('🚀 Probando con diferentes servidores DNS...\n');
  
  const results = [];
  
  for (const serverConfig of dnsServers) {
    const result = await testWithDNSServer(serverConfig);
    results.push(result);
  }
  
  console.log('\n📋 Resumen de resultados:');
  results.forEach(({ server, success, address, error }) => {
    if (success) {
      console.log(`✅ ${server}: Funciona (${address || 'SRV OK'})`);
    } else {
      console.log(`❌ ${server}: Falla - ${error}`);
    }
  });
  
  // Encontrar servidores que funcionan
  const workingServers = results.filter(r => r.success);
  
  if (workingServers.length > 0) {
    console.log('\n🎉 ¡DNS que funcionan!');
    workingServers.forEach(server => {
      console.log(`✅ ${server.server}: ${server.address || 'SRV Records OK'}`);
    });
    
    console.log('\n💡 Solución:');
    console.log('1. Cambia tus DNS a uno de los servidores que funcionan');
    console.log('2. Reinicia tu conexión a internet');
    console.log('3. Vuelve a probar la conexión MongoDB');
    
    console.log('\n🔧 Para cambiar DNS en Windows:');
    console.log('1. Panel de control → Red e Internet → Centro de redes');
    console.log('2. Cambiar configuración del adaptador');
    console.log('3. Clic derecho en tu conexión → Propiedades');
    console.log('4. Protocolo de Internet versión 4 (TCP/IPv4) → Propiedades');
    console.log('5. Usar las siguientes direcciones de servidor DNS:');
    
    workingServers.forEach(server => {
      if (server.server === 'Google DNS') {
        console.log('   - DNS preferido: 8.8.8.8');
        console.log('   - DNS alternativo: 8.8.4.4');
      } else if (server.server === 'Cloudflare DNS') {
        console.log('   - DNS preferido: 1.1.1.1');
        console.log('   - DNS alternativo: 1.0.0.1');
      }
    });
    
  } else {
    console.log('\n❌ Ningún servidor DNS funcionó');
    console.log('🔍 El problema podría ser:');
    console.log('1. Firewall bloqueando DNS');
    console.log('2. Proxy configurado');
    console.log('3. Problemas de red más profundos');
  }
}

runDNSTests();
