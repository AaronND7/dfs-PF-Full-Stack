// backend/src/test-with-mongodb.js - Prueba con driver MongoDB nativo
require('dotenv').config();

console.log('🔍 Probando con driver MongoDB nativo...');
console.log('📍 URI:', process.env.MONGODB_URI);

// 1. Probar con Mongoose
async function testWithMongoose() {
  console.log('\n🗄️ Paso 1: Probando con Mongoose...');
  
  const mongoose = require('mongoose');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Mongoose: Conexión exitosa');
    
    // Probar crear un documento
    const testSchema = new mongoose.Schema({
      test: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    const doc = new TestModel({ test: 'MongoDB Native Test' });
    await doc.save();
    console.log('✅ Mongoose: Documento creado');
    
    await TestModel.deleteOne({ _id: doc._id });
    console.log('✅ Mongoose: Documento eliminado');
    
    await mongoose.connection.close();
    console.log('✅ Mongoose: Conexión cerrada');
    
    return true;
  } catch (error) {
    console.error('❌ Mongoose Error:', error.message);
    return false;
  }
}

// 2. Probar con MongoDB Native Driver
async function testWithNativeDriver() {
  console.log('\n🗄️ Paso 2: Probando con MongoDB Native Driver...');
  
  const { MongoClient } = require('mongodb');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Native Driver: Conexión exitosa');
    
    const db = client.db();
    const collection = db.collection('test');
    
    const result = await collection.insertOne({ test: 'Native Driver Test', timestamp: new Date() });
    console.log('✅ Native Driver: Documento creado');
    
    await collection.deleteOne({ _id: result.insertedId });
    console.log('✅ Native Driver: Documento eliminado');
    
    await client.close();
    console.log('✅ Native Driver: Conexión cerrada');
    
    return true;
  } catch (error) {
    console.error('❌ Native Driver Error:', error.message);
    return false;
  }
}

// 3. Probar conexión básica
async function testBasicConnection() {
  console.log('\n🗄️ Paso 3: Probando conexión básica...');
  
  const { MongoClient } = require('mongodb');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    // Obtener información del cluster
    const admin = client.db().admin();
    const result = await admin.ping();
    console.log('✅ Ping exitoso:', result);
    
    const serverStatus = await admin.serverStatus();
    console.log('✅ Server Status:', serverStatus.version);
    
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Basic Connection Error:', error.message);
    return false;
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas con MongoDB Native Driver...');
  
  const mongooseResult = await testWithMongoose();
  const nativeResult = await testWithNativeDriver();
  const basicResult = await testBasicConnection();
  
  console.log('\n📋 Resultados:');
  console.log('🗄️ Mongoose:', mongooseResult ? '✅' : '❌');
  console.log('🗄️ Native Driver:', nativeResult ? '✅' : '❌');
  console.log('🗄️ Basic Connection:', basicResult ? '✅' : '❌');
  
  if (mongooseResult || nativeResult || basicResult) {
    console.log('\n🎉 ¡Al menos una prueba funcionó!');
    console.log('✅ La conexión a MongoDB Atlas funciona');
  } else {
    console.log('\n❌ Todas las pruebas fallaron');
    console.log('🔍 El problema persiste');
  }
  
  process.exit((mongooseResult || nativeResult || basicResult) ? 0 : 1);
}

runAllTests();
