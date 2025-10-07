// const mysql = require('mysql2');
const { Pool } = require('pg');
require('dotenv').config();
const mysql = require('mysql2/promise');
// const util = require('util'); // Biar bisa promisify

const mysqldb = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Cek koneksi awal (optional)
(async () => {
  try {
    const conn = await mysqldb.getConnection();
    console.log('Connected to MySQL database.');
    conn.release();
  } catch (err) {
    console.error('Database connection failed:', err.stack);
  }
})();




const db = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: true
});


// Tes koneksi (opsional)
db.connect()
  .then(() => console.log('Connected to PostgreSQL (Neon)'))
  .catch(err => console.error('Connection error:', err.stack));
  
  
  


module.exports = {
  mysqldb,
  postgres: db // ganti nama supaya tidak bentrok
};