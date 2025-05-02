require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const fs = require('fs');
const morgan = require('morgan');
const mysql = require('mysql2/promise');

// Import controllers
const authController = require("./controllers/authController");
const homeController = require("./controllers/homeController");
const menuController = require("./controllers/menuController");
const reservationController = require("./controllers/reservationController");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Database Configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: parseInt(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database pool
const pool = mysql.createPool(dbConfig);

// Make pool available globally
global.pool = pool;

// Session store configuration
const sessionStore = new MySQLStore({
  ...dbConfig,
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

// Static file serving - UPDATED TO SIMPLIFIED VERSION
const staticDir = path.join(__dirname, 'public');
console.log(`[Static Files] Serving from: ${staticDir}`);

// Primary static file middleware
app.use(express.static(staticDir));

// Additional debugging middleware
app.use((req, res, next) => {
  if (req.path.match(/\.(css|js|jpg|png)$/)) {
    console.log(`[Static Request] ${req.method} ${req.path}`);
  }
  next();
});

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

// =============================================
// TEST ROUTES
// =============================================
app.get('/test-css', (req, res) => {
  const cssPath = path.join(__dirname, 'public/css/styles.css');
  if (!fs.existsSync(cssPath)) {
    return res.status(404).send('CSS file not found');
  }
  res.type('text/css').sendFile(cssPath);
});

app.get('/static-test', (req, res) => {
  res.json({
    staticDir: staticDir,
    files: {
      css: {
        exists: fs.existsSync(path.join(staticDir, 'css/styles.css')),
        path: path.join(staticDir, 'css/styles.css')
      },
      logo: {
        exists: fs.existsSync(path.join(staticDir, 'images/logo.png')),
        path: path.join(staticDir, 'images/logo.png')
      }
    }
  });
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

// Database Test Route
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ result: rows[0].solution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
app.listen(PORT, () => {
  console.log(`
  ========================================
  SERVER RUNNING: http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  Static files: ${staticDir}
  ========================================
  `);
});

