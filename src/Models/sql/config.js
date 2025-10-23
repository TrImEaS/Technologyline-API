const mysql = require('mysql2')

const LIQUIDSPool = mysql.createPool({
  host: 'localhost',
  user: 'Thomas2024az',
  password: 'Dacarry-123@',
  database: 'LIQUIDS',
  connectionLimit: 10
}).promise()

const ADMINPool = mysql.createPool({
  host: 'localhost',
  user: 'Thomas2024az',
  password: 'Dacarry-123@',
  database: 'admin',
  connectionLimit: 10
}).promise()

module.exports = { ADMINPool, LIQUIDSPool }
