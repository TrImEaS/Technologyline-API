const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'Thomas2024az',
  password: 'Dacarry-123@',
  database: 'ADMIN',
  connectionLimit: 10
}).promise(); // Utiliza el pool de promesas

module.exports = pool