const { pool } = require('../app');

class Reservation {
  static async create(userId, customerName, date, time, guests, phone, requests) {
    const [result] = await pool.query(
      `INSERT INTO reservations 
       (user_id, customer_name, reservation_date, reservation_time, number_of_guests, phone_number, special_requests) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, customerName, date, time, guests, phone, requests]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE user_id = ? ORDER BY reservation_date DESC',
      [userId]
    );
    return reservations;
  }
}

module.exports = Reservation;