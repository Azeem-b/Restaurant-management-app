const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.PMA_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'bookit',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool.promise() to use promises
const promisePool = pool.promise();

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to MySQL database');
    connection.release();
});

module.exports = promisePool; 