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
      console.error('Login error:', err);
      res.redirect('/login?error=Login failed. Please try again.');
    }
  },

  // Show registration form (EXISTING)
  showRegisterForm: (req, res) => {
    res.render('register', { 
      error: req.query.error,
      formData: req.query.formData ? JSON.parse(req.query.formData) : null
    });
  },

  // Handle registration (EXISTING)
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        console.log('Missing required fields:', { name, email, password: password ? 'provided' : 'missing' });
        return res.redirect(`/register?error=All fields are required&formData=${JSON.stringify(req.body)}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format:', email);
        return res.redirect(`/register?error=Invalid email format&formData=${JSON.stringify(req.body)}`);
      }

      // Validate password length
      if (password.length < 8) {
        console.log('Password too short');
        return res.redirect(`/register?error=Password must be at least 8 characters long&formData=${JSON.stringify(req.body)}`);
      }

      console.log('Attempting to register user:', { name, email });
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create(name, email, hashedPassword);
      
      console.log('Registration successful for:', email);
      res.redirect('/login?registered=true');
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message === 'Email already exists') {
        errorMessage = 'Email already exists';
      } else if (err.message.includes('Database error')) {
        errorMessage = 'Database connection error. Please try again later.';
      }
      
      res.redirect(`/register?error=${encodeURIComponent(errorMessage)}&formData=${JSON.stringify(req.body)}`);
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
  },

  // Show forgot password form
  showForgotPasswordForm: (req, res) => {
    res.render('forgot-password');
  },

  // Handle forgot password form submission
  handleForgotPassword: (req, res) => {
    const { email } = req.body;
    // In a real app, you would send a reset email here
    res.render('forgot-password', {
      message: `If an account with email ${email} exists, a reset link will be sent (feature coming soon).`
    });
  }
};