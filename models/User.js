const mysql = require('mysql2/promise');

// Create a single connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connection established successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

class User {
  static async create(name, email, password) {
    try {
      console.log('Attempting to create user:', { name, email });
      
      // First check if email exists
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        console.log('Email already exists:', email);
        throw new Error('Email already exists');
      }

      // Insert new user
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, password]
      );

      console.log('User created successfully with ID:', result.insertId);
      return result.insertId;
    } catch (err) {
      console.error('Error creating user:', err);
      if (err.message === 'Email already exists') {
        throw err;
      }
      throw new Error('Database error while creating user');
    }
  }

  static async findByEmail(email) {
    try {
      console.log('Finding user by email:', email);
      const [users] = await pool.query(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      
      if (users.length === 0) {
        console.log('No user found with email:', email);
        return null;
      }
      
      console.log('User found:', users[0].id);
      return users[0];
    } catch (err) {
      console.error('Error finding user:', err);
      throw new Error('Database error while finding user');
    }
  }
}

module.exports = User;