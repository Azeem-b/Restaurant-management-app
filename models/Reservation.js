const pool = require('../config/database');

class Reservation {
  static async create(userId, customerName, date, time, guests, phone, requests) {
    try {
      console.log('Creating reservation with data:', { 
        userId, 
        customerName, 
        date, 
        time, 
        guests, 
        phone, 
        requests 
      });
      
      // Validate input
      if (!userId || !customerName || !date || !time || !guests || !phone) {
        throw new Error('Missing required fields');
      }

      const [result] = await pool.query(
        `INSERT INTO reservations 
         (user_id, customer_name, reservation_date, reservation_time, number_of_guests, phone_number, special_requests) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, customerName, date, time, guests, phone, requests || '']
      );
      
      console.log('Reservation created successfully with ID:', result.insertId);
      return result.insertId;
    } catch (err) {
      console.error('Error creating reservation:', err);
      throw err;
    }
  }

  static async findByUserId(userId) {
    try {
      console.log('Finding reservations for user ID:', userId);
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      const [reservations] = await pool.query(
        `SELECT * FROM reservations 
         WHERE user_id = ? 
         ORDER BY reservation_date DESC, reservation_time DESC`,
        [userId]
      );
      
      console.log(`Found ${reservations.length} reservations for user ${userId}:`, reservations);
      return reservations;
    } catch (err) {
      console.error('Error finding reservations:', err);
      throw err;
    }
  }

  static async deleteById(userId, reservationId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM reservations WHERE id = ? AND user_id = ?',
        [reservationId, userId]
      );
      console.log(`Deleted reservation ${reservationId} for user ${userId}:`, result.affectedRows > 0);
      return result.affectedRows > 0;
    } catch (err) {
      console.error('Error deleting reservation:', err);
      throw err;
    }
  }
}

module.exports = Reservation;