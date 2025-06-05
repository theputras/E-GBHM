// const mysql = require('mysql2');
const { Pool } = require('pg');
require('dotenv').config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// db.getConnection((err, connection) => {
//   if (err) {
//     console.error('Database connection failed:', err.stack);
//     return;
//   }
//   console.log('Connected to database.');
//    connection.release(); // kembalikan ke pool
// });
// module.exports = db.promise(); // export sebagai promise pool

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

module.exports = db;