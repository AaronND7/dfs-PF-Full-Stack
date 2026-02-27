// backend/src/test-standard-uri.js - Probar con URI estándar
const { MongoClient } = require('mongodb');

console.log('🔍 Probando con URI estándar de MongoDB Atlas...');

// URI estándar que debería funcionar
const standardURIs = [
  'mongodb+srv://sudo_cesar:emanuel777@escuela.rdt4jqq.mongodb.net',
  'mongodb+srv://sudo_cesar:emanuel777@escuela.rdt4jqq.mongodb.net/?retryWrites=true&w=majority',
  'mongodb+srv://sudo_cesar:emanuel777@escuela.rdt4jqq.mongodb.net/?ssl=true&authSource=admin'
];

async function testStandardURI(uri, name) {
  console.log(`\n🔄 Probando ${name}...`);
  console.log(`📍 ${uri}`);
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log(`✅ ${name}: Conexión exitosa`);
    
    // Probar ping
    const db = client.db();
    await db.command({ ping: 1 });
    console.log(`✅ ${name}: Ping exitoso`);
    
    await client.close();
    return name;
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    return null;
  }
}

async function runStandardTests() {
  console.log('🚀 Probando URIs estándar...\n');
  
  for (let i = 0; i < standardURIs.length; i++) {
    const result = await testStandardURI(standardURIs[i], `Standard ${i + 1}`);
    if (result) {
      console.log(`\n🎉 ¡ÉXITO! ${result} funcionó`);
      console.log('✅ Esta es la URI correcta');
      
      // Guardar la URI que funcionó
      const fs = require('fs');
      const path = require('path');
      
      const workingURI = standardURIs[i];
      const envContent = `MONGODB_URI=${workingURI}\nAZURE_CLIENT_ID=tu-client-id-de-azure-ad\nAZURE_CLIENT_SECRET=tu-client-secret-de-azure-ad\nAZURE_AUTHORITY=https://login.microsoftonline.com/tu-tenant-id\nAZURE_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback\nPORT=3000\nNODE_ENV=development`;
      
      fs.writeFileSync(path.join(__dirname, '../working-env.txt'), envContent);
      console.log(`💡 URI guardada en working-env.txt: ${workingURI}`);
      
      process.exit(0);
    }
  }
  
  console.log('\n❌ Ninguna URI estándar funcionó');
  console.log('🔍 El problema sigue siendo el nombre del cluster');
  process.exit(1);
}

runStandardTests();
