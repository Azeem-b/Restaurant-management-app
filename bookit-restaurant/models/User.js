const { pool } = require('../app'); // Import pool from app.js

class User {
  static async create(name, email, password) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return users[0];
  }
}

module.exports = User;