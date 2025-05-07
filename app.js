require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const fs = require('fs');
const morgan = require('morgan');
const pool = require('./config/database');

// Import controllers
const authController = require("./controllers/authController");
const homeController = require("./controllers/homeController");
const menuController = require("./controllers/menuController");
const reservationController = require("./controllers/reservationController");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Session store configuration
const sessionStore = new MySQLStore({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.DB_PORT),
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

// =============================================
// MIDDLEWARE SETUP
// =============================================
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Static file serving
const staticDir = path.join(__dirname, 'public');
console.log(`[Static Files] Serving from: ${staticDir}`);

// Ensure public directory exists
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
  console.log(`Created static directory: ${staticDir}`);
}

// Primary static file middleware
app.use(express.static(staticDir));

// Request logging
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-32-chars-min",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Template variables middleware
app.use((req, res, next) => {
  res.locals = {
    user: req.session.user,
    currentPath: req.path,
    isLoginPage: req.path === '/login',
    isRegisterPage: req.path === '/register',
    isDashboardPage: req.path === '/dashboard',
    isProduction: isProduction,
    baseUrl: `${req.protocol}://${req.get('host')}`
  };
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// =============================================
// MAIN ROUTES
// =============================================
app.get("/", homeController.index);
app.get("/dashboard", authController.ensureLoggedIn, homeController.dashboard);

// Auth Routes
app.get("/login", authController.showLoginForm);
app.post("/login", authController.login);
app.get("/register", authController.showRegisterForm);
app.post("/register", authController.register);
app.get("/logout", authController.logout);

// Menu Route
app.get("/menu", menuController.showMenu);

// Reservation Routes
app.get("/reserve", authController.ensureLoggedIn, reservationController.showForm);
app.post("/reserve", authController.ensureLoggedIn, reservationController.create);

// Forgot Password Routes
app.get("/forgot-password", authController.showForgotPasswordForm);
app.post("/forgot-password", authController.handleForgotPassword);

// Database Test Route
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, result: rows[0].solution });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/test-pug', (req, res) => {
  res.render('forgot-password', { message: 'Test message' });
});

// Cancel Reservation Route
app.post('/cancel-reservation/:id', authController.ensureLoggedIn, reservationController.cancel);

// =============================================
// ERROR HANDLING
// =============================================
app.use((req, res, next) => {
  res.status(404).render("error", {
    title: "Not Found",
    message: "The page you requested was not found",
    status: 404
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).render("error", {
    title: "Server Error",
    message: isProduction ? "Something went wrong" : err.message,
    stack: isProduction ? null : err.stack,
    status: 500
  });
});

// =============================================
// SERVER STARTUP
// =============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ========================================
  SERVER RUNNING: http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Static files: ${staticDir}
  Database host: ${process.env.MYSQL_HOST}
  Database port: ${process.env.DB_PORT}
  ========================================
  `);
});

