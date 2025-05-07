const Reservation = require('../models/Reservation');

module.exports = {
    index: (req, res) => res.render('index'),
    
    dashboard: async (req, res) => {
        try {
            if (!req.session.user) {
                console.log('No user session found, redirecting to login');
                return res.redirect('/login');
            }

            console.log('Fetching dashboard for user:', req.session.user);
            console.log('Fetching reservations for user ID:', req.session.user.id);
            console.log('Session user:', req.session.user);
            
            const reservations = await Reservation.findByUserId(req.session.user.id);
            console.log('Found reservations:', reservations);
            console.log('Reservations sent to dashboard:', reservations);

            // Ensure user object has all required properties
            const user = {
                id: req.session.user.id,
                name: req.session.user.name,
                email: req.session.user.email,
                role: req.session.user.role || 'user'
            };

            res.render('dashboard', { 
                user,
                reservations,
                success: req.query.success,
                error: req.query.error
            });
        } catch (err) {
            console.error('Error in dashboard:', err);
            res.render('dashboard', { 
                user: req.session.user,
                reservations: [],
                error: 'Failed to load reservations. Please try again.'
            });
        }
    }
};
