// backend/src/test-connection.js - Prueba de conexión a MongoDB
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔍 Probando conexión a MongoDB Atlas...');
    console.log('📍 URI:', process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Conexión exitosa a MongoDB Atlas!');
    console.log('🎯 Host:', conn.connection.host);
    console.log('📊 Base de datos:', conn.connection.name);
    
    // Probar crear un documento de prueba
    const testSchema = new mongoose.Schema({
      nombre: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({
      nombre: 'Prueba de conexión',
      timestamp: new Date()
    });
    
    await testDoc.save();
    console.log('✅ Documento de prueba creado exitosamente');
    
    // Eliminar el documento de prueba
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🗑️ Documento de prueba eliminado');
    
    console.log('🎉 ¡La conexión a MongoDB Atlas funciona perfectamente!');
    
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:');
    console.error('📋 Detalles del error:', error.message);
    
    // Mostrar información adicional para depuración
    if (error.message.includes('ECONNREFUSED')) {
      console.error('🔍 Posibles causas:');
      console.error('  1. Problemas de red o firewall');
      console.error('  2. URI de MongoDB incorrecta');
      console.error('  3. Cluster de MongoDB no disponible');
      console.error('  4. Credenciales incorrectas');
    }
    
    process.exit(1);
  }
};

testConnection();
