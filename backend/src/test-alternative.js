// backend/src/test-alternative.js - Prueba con diferentes formatos de URI
require('dotenv').config();

const mongoose = require('mongoose');

console.log('🔍 Probando diferentes formatos de URI...');

// URI 1: La que tenemos
const uri1 = process.env.MONGODB_URI;

// URI 2: Sin parámetros
const uri2 = 'mongodb+srv://sudo_cesar:emanuel777@escuela.rdt4jqq.mongodb.net';

// URI 3: Con parámetros estándar
const uri3 = 'mongodb+srv://sudo_cesar:emanuel777@escuela.rdt4jqq.mongodb.net/?retryWrites=true&w=majority';

const uris = [
  { name: 'URI Original', uri: uri1 },
  { name: 'URI Sin Parámetros', uri: uri2 },
  { name: 'URI Estándar', uri: uri3 }
];

async function testURI(name, uri) {
  console.log(`\n🔄 Probando ${name}...`);
  console.log(`📍 ${uri}`);
  
  try {
    await mongoose.connect(uri);
    console.log(`✅ ${name} - Conexión exitosa`);
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.error(`❌ ${name} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  let success = false;
  
  for (const { name, uri } of uris) {
    const result = await testURI(name, uri);
    if (result) {
      success = true;
      break;
    }
  }
  
  if (success) {
    console.log('\n🎉 ¡Alguna URI funcionó!');
  } else {
    console.log('\n❌ Ninguna URI funcionó');
    console.log('🔍 Verifica que el cluster esté activo y accesible');
  }
  
  process.exit(success ? 0 : 1);
}

runTests();
