const Reservation = require('../models/Reservation');

module.exports = {
  showForm: (req, res) => {
    res.render('reserve');
  },

  create: async (req, res) => {
    try {
      const { customer_name, reservation_date, reservation_time, number_of_guests, phone_number, special_requests } = req.body;
      await Reservation.create(
        req.session.user.id,
        customer_name,
        reservation_date,
        reservation_time,
        number_of_guests,
        phone_number,
        special_requests
      );
      res.redirect('/dashboard');
    } catch (err) {
      res.render('reserve', { 
        error: 'Reservation failed', 
        formData: req.body 
      });
    }
  }
};