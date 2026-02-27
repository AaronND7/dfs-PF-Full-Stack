// backend/src/test-exact-uri.js - Prueba con URI exacta de MongoDB Atlas
require('dotenv').config();

console.log('🔍 Probando con URI exacta de MongoDB Atlas...');
console.log('📍 URI:', process.env.MONGODB_URI);

// Probar con diferentes opciones de conexión
const mongoose = require('mongoose');

async function testWithOptions() {
  const options = [
    {
      name: 'Opción 1: Básica',
      opts: {}
    },
    {
      name: 'Opción 2: Con timeout',
      opts: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000
      }
    },
    {
      name: 'Opción 3: Con retry',
      opts: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 30000,
        bufferCommands: false,
        bufferMaxEntries: 0
      }
    },
    {
      name: 'Opción 4: Sin DNS SRV',
      opts: {
        useNewUrlParser: false,
        useUnifiedTopology: false
      }
    }
  ];
  
  for (const { name, opts } of options) {
    try {
      console.log(`\n🔄 ${name}...`);
      
      await mongoose.connect(process.env.MONGODB_URI, opts);
      console.log(`✅ ${name}: Conexión exitosa`);
      
      // Probar operación básica
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      console.log(`📋 Colecciones encontradas: ${collections.length}`);
      
      await mongoose.connection.close();
      console.log(`✅ ${name}: Conexión cerrada`);
      
      return name;
    } catch (error) {
      console.error(`❌ ${name}: ${error.message}`);
      
      // Análisis específico del error
      if (error.message.includes('ENOTFOUND')) {
        console.log(`🔍 ${name}: DNS no encuentra el servidor`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`🔍 ${name}: Conexión rechazada`);
      } else if (error.message.includes('Authentication failed')) {
        console.log(`🔍 ${name}: Error de autenticación`);
      } else if (error.message.includes('timeout')) {
        console.log(`🔍 ${name}: Timeout de conexión`);
      }
    }
  }
  
  return null;
}

// Probar con MongoDB Native Driver
async function testNativeDriver() {
  console.log('\n🗄️ Probando con MongoDB Native Driver...');
  
  const { MongoClient } = require('mongodb');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000
    });
    
    await client.connect();
    console.log('✅ Native Driver: Conexión exitosa');
    
    const db = client.db();
    const admin = db.admin();
    
    // Probar ping
    const pingResult = await admin.ping();
    console.log('✅ Ping exitoso:', pingResult);
    
    // Probar server status
    const serverStatus = await admin.serverStatus();
    console.log('✅ Server version:', serverStatus.version);
    
    // Listar databases
    const databases = await admin.listDatabases();
    console.log('✅ Databases:', databases.databases.length);
    
    await client.close();
    console.log('✅ Native Driver: Conexión cerrada');
    
    return true;
  } catch (error) {
    console.error('❌ Native Driver Error:', error.message);
    return false;
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas exhaustivas...\n');
  
  const mongooseResult = await testWithOptions();
  const nativeResult = await testNativeDriver();
  
  console.log('\n📋 Resultados finales:');
  console.log('🗄️ Mongoose:', mongooseResult || '❌');
  console.log('🗄️ Native Driver:', nativeResult ? '✅' : '❌');
  
  if (mongooseResult || nativeResult) {
    console.log('\n🎉 ¡ÉXITO! La conexión funciona');
    console.log('✅ El sistema está listo para usar');
    
    if (mongooseResult) {
      console.log(`🎯 Recomendación: Usar ${mongooseResult}`);
    }
  } else {
    console.log('\n❌ Todas las pruebas fallaron');
    console.log('🔍 Posibles causas:');
    console.log('  1. La URI tiene un error tipográfico');
    console.log('  2. Problemas de red/firewall');
    console.log('  3. El cluster no está realmente accesible');
    console.log('  4. Credenciales incorrectas');
  }
  
  process.exit((mongooseResult || nativeResult) ? 0 : 1);
}

runTests();
