const Reservation = require('../models/Reservation');

module.exports = {
  showForm: (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    res.render('reserve', { 
      error: req.query.error,
      formData: req.query.formData ? JSON.parse(req.query.formData) : null
    });
  },

  create: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/login');
      }

      console.log('Received reservation request:', req.body);
      const { customer_name, reservation_date, reservation_time, number_of_guests, phone_number, special_requests } = req.body;

      // Validate required fields
      if (!customer_name || !reservation_date || !reservation_time || !number_of_guests || !phone_number) {
        console.log('Missing required fields:', req.body);
        return res.redirect(`/reserve?error=All fields are required&formData=${JSON.stringify(req.body)}`);
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(reservation_date)) {
        console.log('Invalid date format:', reservation_date);
        return res.redirect(`/reserve?error=Invalid date format&formData=${JSON.stringify(req.body)}`);
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(reservation_time)) {
        console.log('Invalid time format:', reservation_time);
        return res.redirect(`/reserve?error=Invalid time format&formData=${JSON.stringify(req.body)}`);
      }

      // Validate number of guests
      const guests = parseInt(number_of_guests);
      if (isNaN(guests) || guests < 1) {
        console.log('Invalid number of guests:', number_of_guests);
        return res.redirect(`/reserve?error=Invalid number of guests&formData=${JSON.stringify(req.body)}`);
      }

      console.log('Creating reservation for user:', req.session.user.id);
      const reservationId = await Reservation.create(
        req.session.user.id,
        customer_name,
        reservation_date,
        reservation_time,
        guests,
        phone_number,
        special_requests || ''
      );

      console.log('Reservation created successfully with ID:', reservationId);
      
      // Verify the reservation was created
      const reservations = await Reservation.findByUserId(req.session.user.id);
      console.log('Current reservations for user:', reservations);

      res.redirect('/dashboard?success=Reservation created successfully');
    } catch (err) {
      console.error('Reservation error:', err);
      res.redirect(`/reserve?error=Failed to create reservation. Please try again.&formData=${JSON.stringify(req.body)}`);
    }
  },

  cancel: async (req, res) => {
    try {
      const reservationId = req.params.id;
      await Reservation.deleteById(req.session.user.id, reservationId);
      res.redirect('/dashboard?success=Reservation cancelled successfully');
    } catch (err) {
      console.error('Cancel reservation error:', err);
      res.redirect('/dashboard?error=Failed to cancel reservation');
    }
  }
};