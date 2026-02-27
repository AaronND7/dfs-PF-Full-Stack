// backend/src/test-friend-config.js - Probar con configuración que funcionó
require('dotenv').config();

console.log('🔍 Probando con configuración que funcionó para un amigo...');
console.log('📍 URI:', process.env.MONGODB_URI);

// 1. Probar exactamente como lo hizo el amigo
const { MongoClient } = require('mongodb');

async function testFriendMethod() {
  console.log('\n🗄️ Método 1: Exactamente como el amigo...');
  
  try {
    // Conexión simple como la que suele funcionar
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Conexión exitosa (método amigo)');
    
    // Operación básica
    const db = client.db();
    await db.command({ ping: 1 });
    console.log('✅ Ping exitoso');
    
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Método amigo falló:', error.message);
    return false;
  }
}

// 2. Probar con diferentes opciones de conexión
async function testDifferentOptions() {
  console.log('\n🗄️ Método 2: Diferentes opciones...');
  
  const options = [
    { name: 'Opción A', opts: {} },
    { name: 'Opción B', opts: { maxPoolSize: 10 } },
    { name: 'Opción C', opts: { serverSelectionTimeoutMS: 5000 } },
    { name: 'Opción D', opts: { connectTimeoutMS: 5000, socketTimeoutMS: 30000 } }
  ];
  
  for (const { name, opts } of options) {
    try {
      console.log(`🔄 ${name}...`);
      const client = new MongoClient(process.env.MONGODB_URI, opts);
      await client.connect();
      console.log(`✅ ${name}: Conexión exitosa`);
      await client.close();
      return name;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }
  
  return null;
}

// 3. Probar con Mongoose (como está configurado el sistema)
async function testMongooseConfig() {
  console.log('\n🗄️ Método 3: Mongoose (configuración del sistema)...');
  
  const mongoose = require('mongoose');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Mongoose: Conexión exitosa');
    
    // Probar crear un modelo simple
    const testSchema = new mongoose.Schema({
      test: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('TestConnection', testSchema);
    
    // Insertar y eliminar
    const doc = new TestModel({ test: 'Friend Config Test' });
    await doc.save();
    console.log('✅ Mongoose: Documento creado');
    
    await TestModel.deleteOne({ _id: doc._id });
    console.log('✅ Mongoose: Documento eliminado');
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.error('❌ Mongoose falló:', error.message);
    return false;
  }
}

// 4. Probar con URI limpia
async function testCleanURI() {
  console.log('\n🗄️ Método 4: URI limpia...');
  
  // Quitar parámetros extra
  const cleanURI = process.env.MONGODB_URI.split('?')[0];
  console.log('📍 URI limpia:', cleanURI);
  
  try {
    const client = new MongoClient(cleanURI);
    await client.connect();
    console.log('✅ URI limpia: Conexión exitosa');
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ URI limpia falló:', error.message);
    return false;
  }
}

// 5. Verificar entorno
function checkEnvironment() {
  console.log('\n🔍 Verificación del entorno:');
  
  console.log('📋 Node.js version:', process.version);
  console.log('📋 Platform:', process.platform);
  console.log('📋 Arch:', process.arch);
  
  const fs = require('fs');
  const path = require('path');
  
  // Verificar archivo .env
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ .env file exists');
    console.log('📋 .env length:', envContent.length);
    
    // Verificar que contenga MONGODB_URI
    if (envContent.includes('MONGODB_URI')) {
      console.log('✅ MONGODB_URI found in .env');
    } else {
      console.log('❌ MONGODB_URI not found in .env');
    }
  } else {
    console.log('❌ .env file not found');
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas con configuración de amigo...\n');
  
  checkEnvironment();
  
  const friendResult = await testFriendMethod();
  const optionsResult = await testDifferentOptions();
  const mongooseResult = await testMongooseConfig();
  const cleanResult = await testCleanURI();
  
  console.log('\n📋 Resultados finales:');
  console.log('🗄️ Método Amigo:', friendResult ? '✅' : '❌');
  console.log('🗄️ Diferentes Opciones:', optionsResult || '❌');
  console.log('🗄️ Mongoose:', mongooseResult ? '✅' : '❌');
  console.log('🗄️ URI Limpia:', cleanResult ? '✅' : '❌');
  
  const success = friendResult || optionsResult || mongooseResult || cleanResult;
  
  if (success) {
    console.log('\n🎉 ¡ÉXITO! Alguna configuración funcionó');
    console.log('✅ El sistema está listo para usar');
    
    if (optionsResult) {
      console.log(`🎯 Recomendación: Usar ${optionsResult}`);
    }
  } else {
    console.log('\n❌ Todas las configuraciones fallaron');
    console.log('🔍 Posibles problemas:');
    console.log('  1. La URI es diferente a la del amigo');
    console.log('  2. Problemas de red específicos');
    console.log('  3. Configuración de firewall');
    console.log('  4. Versión de Node.js diferente');
  }
  
  process.exit(success ? 0 : 1);
}

runAllTests();
