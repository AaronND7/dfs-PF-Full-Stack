// backend/src/server-simple.js - Servidor mínimo
require('dotenv').config();
const app = require("./app-simple");
const PORT = process.env.PORT || 3000;

console.log('🔍 Variables de entorno:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Cargado' : '❌ No cargado');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Cargado' : '❌ No cargado');
console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? '✅ Cargado' : '❌ No cargado');

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  console.log('✅ Servidor iniciado correctamente');
});
