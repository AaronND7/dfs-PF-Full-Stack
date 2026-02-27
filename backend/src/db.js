// backend/src/db.js - Conexión a MongoDB Atlas
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔍 Conectando a MongoDB Atlas...');
    console.log('📍 URI:', process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI no está definida en las variables de entorno');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Atlas Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
