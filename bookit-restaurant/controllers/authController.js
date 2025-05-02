const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = {
  // Authentication middleware (NEW)
  ensureLoggedIn: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    res.redirect('/login');
  },

  // Show login form (EXISTING)
  showLoginForm: (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('login', { 
      error: req.query.error,
      success: req.query.registered ? 'Registration successful!' : null
    });
  },

  // Handle login (EXISTING)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.redirect('/login?error=Invalid credentials');
      }

      req.session.user = { id: user.id, name: user.name, email: user.email };
      res.redirect('/dashboard');
    } catch (err) {
      res.redirect('/login?error=Login failed');
    }
  },

  // Show registration form (EXISTING)
  showRegisterForm: (req, res) => {
    res.render('register');
  },

  // Handle registration (EXISTING)
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create(name, email, hashedPassword);
      res.redirect('/login?registered=true');
    } catch (err) {
      res.render('register', { 
        error: 'Registration failed', 
        formData: req.body 
      });
    }
  },

  // Handle logout (EXISTING)
  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  },

  // Optional: Admin check middleware (NEW)
  ensureAdmin: (req, res, next) => {
    if (req.session.user?.isAdmin) {
      return next();
    }
    res.status(403).render('error', { 
      message: 'Unauthorized: Admin access required' 
    });
  }
};