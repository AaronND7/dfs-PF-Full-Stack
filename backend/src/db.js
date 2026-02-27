// backend/src/db.js
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",     // en tu shell será ./.pgsocket o localhost
  port: parseInt(process.env.PGPORT || "5432", 10),
  user: process.env.PGUSER || "app_user",
  password: process.env.PGPASSWORD || "devpass",
  database: process.env.PGDATABASE || "escuela_musica",
});

module.exports = pool;
