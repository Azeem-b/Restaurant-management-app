
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const config = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(config);

// Test database connection
async function testConnection() {
  let retries = 5;
  while (retries > 0) {
    const connection = await pool.getConnection();
    try {
      await connection.ping();
      console.log('Database connection successful');
      connection.release();
      return true;
    } catch (err) {
      console.error(`Database connection failed (${retries} retries left):`, err.message);
      connection.release();
      retries--;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Could not establish database connection after retries');
}

// Execute SQL queries
async function query(sql, params) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query(sql, params);
    return results;
  } catch (err) {
    console.error('Query failed:', err);
    throw err;
  } finally {
    connection.release();
  }
}

// Export functions
module.exports = {
  pool,
  testConnection,
  query
};
