// backend/src/test-final.js - Prueba final con URI correcta
require('dotenv').config();
const dns = require('dns');

console.log('🔍 Probando con la URI correcta...');
console.log('📍 URI:', process.env.MONGODB_URI);

// 1. Probar DNS primero
console.log('\n🌐 Paso 1: Probando DNS...');
dns.lookup('escuela.rdt4jqq.mongodb.net', (err, address, family) => {
  if (err) {
    console.error('❌ DNS falló:', err.message);
    console.log('🔍 El nombre del cluster podría estar mal o no existir');
    return;
  }
  
  console.log('✅ DNS exitoso:', address);
  
  // 2. Si DNS funciona, probar MongoDB
  console.log('\n🗄️ Paso 2: Probando MongoDB...');
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Conexión MongoDB exitosa');
      console.log('🎉 ¡Todo funciona correctamente!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error MongoDB:', err.message);
      
      if (err.message.includes('Authentication failed')) {
        console.error('🔍 Error de autenticación');
        console.error('💡 Verifica usuario y contraseña');
      } else if (err.message.includes('ENOTFOUND')) {
        console.error('🔍 DNS no encuentra el servidor');
      } else if (err.message.includes('ECONNREFUSED')) {
        console.error('🔍 Conexión rechazada');
        console.error('💡 Verifica que el cluster esté activo');
      }
      
      process.exit(1);
    });
});
