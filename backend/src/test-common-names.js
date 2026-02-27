// backend/src/test-common-names.js - Probar nombres comunes de cluster
const dns = require('dns');

console.log('🔍 Probando nombres comunes de cluster...');

const commonNames = [
  'cluster0.rdt4jqq.mongodb.net',
  'cluster1.rdt4jqq.mongodb.net',
  'cluster-school.rdt4jqq.mongodb.net',
  'musicschool.rdt4jqq.mongodb.net',
  'music-school.rdt4jqq.mongodb.net',
  'aaradem.rdt4jqq.mongodb.net',
  'escuela-musica.rdt4jqq.mongodb.net',
  'school.rdt4jqq.mongodb.net'
];

async function testDNS(hostname) {
  return new Promise((resolve) => {
    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        resolve({ hostname, success: false, error: err.message });
      } else {
        resolve({ hostname, success: true, address, family });
      }
    });
  });
}

async function testSRV(hostname) {
  return new Promise((resolve) => {
    const srvRecord = `_mongodb._tcp.${hostname}`;
    dns.resolveSrv(srvRecord, (err, records) => {
      if (err) {
        resolve({ hostname, success: false, error: err.message });
      } else {
        resolve({ hostname, success: true, records });
      }
    });
  });
}

async function runTests() {
  console.log('\n🌐 Probando DNS lookup...');
  const dnsResults = await Promise.all(commonNames.map(testDNS));
  
  console.log('\n🗄️ Probando SRV records...');
  const srvResults = await Promise.all(commonNames.map(testSRV));
  
  console.log('\n📋 Resultados DNS:');
  dnsResults.forEach(({ hostname, success, address, error }) => {
    if (success) {
      console.log(`✅ ${hostname}: ${address}`);
    } else {
      console.log(`❌ ${hostname}: ${error}`);
    }
  });
  
  console.log('\n📋 Resultados SRV:');
  srvResults.forEach(({ hostname, success, records, error }) => {
    if (success) {
      console.log(`✅ ${hostname}: ${records.length} records`);
    } else {
      console.log(`❌ ${hostname}: ${error}`);
    }
  });
  
  // Encontrar nombres que funcionen
  const workingDNS = dnsResults.filter(r => r.success);
  const workingSRV = srvResults.filter(r => r.success);
  
  if (workingDNS.length > 0) {
    console.log('\n🎯 Nombres que resuelven DNS:');
    workingDNS.forEach(r => console.log(`✅ ${r.hostname}: ${r.address}`));
  }
  
  if (workingSRV.length > 0) {
    console.log('\n🎯 Nombres que tienen SRV records:');
    workingSRV.forEach(r => console.log(`✅ ${r.hostname}: ${r.records.length} records`));
    
    console.log('\n💡 Prueba con estas URIs:');
    workingSRV.forEach(r => {
      const uri = `mongodb+srv://sudo_cesar:emanuel777@${r.hostname}?appName=escuela`;
      console.log(`📍 ${uri}`);
    });
  } else {
    console.log('\n❌ Ningún nombre tiene SRV records funcionales');
    console.log('🔍 El problema está en el nombre del cluster');
  }
}

runTests();
