// backend/src/test-debug.js - Diagnóstico completo
require('dotenv').config();

console.log('🔍 Diagnóstico completo de conexión MongoDB');
console.log('📍 URI:', process.env.MONGODB_URI);

// 1. Verificar formato de URI
function validateURI(uri) {
  console.log('\n📋 Paso 1: Validando formato de URI...');
  
  if (!uri.startsWith('mongodb+srv://')) {
    console.log('❌ URI debe empezar con mongodb+srv://');
    return false;
  }
  
  if (!uri.includes('@')) {
    console.log('❌ URI debe contener @');
    return false;
  }
  
  if (!uri.includes('.mongodb.net')) {
    console.log('❌ URI debe terminar con .mongodb.net');
    return false;
  }
  
  console.log('✅ Formato de URI válido');
  return true;
}

// 2. Extraer componentes
function parseURI(uri) {
  console.log('\n🔍 Paso 2: Analizando componentes...');
  
  try {
    const cleanURI = uri.replace('mongodb+srv://', '');
    const [credentials, hostPart] = cleanURI.split('@');
    const [host, ...params] = hostPart.split('?');
    
    console.log('👤 Usuario:', credentials.split(':')[0]);
    console.log('🔐 Contraseña:', credentials.split(':')[1] ? '***' : 'NO ENCONTRADA');
    console.log('🌐 Host:', host);
    console.log('📋 Parámetros:', params.length > 0 ? params.join('?') : 'SIN PARÁMETROS');
    
    return { host, credentials };
  } catch (error) {
    console.error('❌ Error parseando URI:', error.message);
    return null;
  }
}

// 3. Probar diferentes métodos de conexión
async function testConnection() {
  console.log('\n🗄️ Paso 3: Probando conexión MongoDB...');
  
  const mongoose = require('mongoose');
  
  try {
    // Intento 1: Conexión básica
    console.log('🔄 Intento 1: Conexión básica...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error en intento 1:', error.message);
    
    // Intento 2: Con opciones adicionales
    console.log('\n🔄 Intento 2: Con opciones adicionales...');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Conexión exitosa con opciones');
      return true;
    } catch (error2) {
      console.error('❌ Error en intento 2:', error2.message);
      
      // Análisis específico del error
      if (error2.message.includes('ENOTFOUND')) {
        console.error('🔍 DNS no encuentra el servidor');
        console.error('💡 Verifica el nombre del cluster');
      } else if (error2.message.includes('Authentication failed')) {
        console.error('🔍 Error de autenticación');
        console.error('💡 Verifica usuario y contraseña');
      } else if (error2.message.includes('ECONNREFUSED')) {
        console.error('🔍 Conexión rechazada');
        console.error('💡 Verifica que el cluster esté activo');
      }
      
      return false;
    }
  }
}

// Ejecutar diagnóstico
async function runDiagnosis() {
  if (!validateURI(process.env.MONGODB_URI)) {
    process.exit(1);
  }
  
  const parsed = parseURI(process.env.MONGODB_URI);
  if (!parsed) {
    process.exit(1);
  }
  
  const success = await testConnection();
  
  if (success) {
    console.log('\n🎉 ¡Diagnóstico completado exitosamente!');
    console.log('✅ La conexión a MongoDB funciona correctamente');
  } else {
    console.log('\n❌ Diagnóstico fallido');
    console.log('🔍 Revisa los puntos mencionados arriba');
  }
  
  process.exit(success ? 0 : 1);
}

runDiagnosis();
