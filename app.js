require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const MySQLStore = require("express-mysql-session")(session);
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DEBUG = true;

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

const pool = mysql.createPool(dbConfig);

// Initialize database schema
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        reservation_date DATE NOT NULL,
        reservation_time TIME NOT NULL,
        number_of_guests INT NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database tables verified/created successfully");
  } catch (err) {
    console.error("Database initialization error:", err);
    process.exit(1);
  }
}

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
// NUCLEAR-PROOF STATIC FILE SOLUTION
// =============================================
const staticDir = path.join(__dirname, 'static');
const imagesDir = path.join(staticDir, 'images');

// 1. Verify file structure with EXTREME debugging
console.log('\n===== FILE SYSTEM VERIFICATION =====');
try {
  console.log('Static root exists:', fs.existsSync(staticDir));
  if (fs.existsSync(staticDir)) {
    console.log('Static root contents:', fs.readdirSync(staticDir));
  }
  
  console.log('Images dir exists:', fs.existsSync(imagesDir));
  if (fs.existsSync(imagesDir)) {
    console.log('Images dir contents:', fs.readdirSync(imagesDir));
  }
} catch (err) {
  console.error('FILESYSTEM ERROR:', err);
  process.exit(1);
}
console.log('===================================');

// 2. COMPLETELY disable caching
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Static-Files': 'enabled'
  });
  next();
});

// 3. MANUAL file serving with absolute paths
const serveStaticFile = (filePath, contentType) => {
  return (req, res) => {
    if (fs.existsSync(filePath)) {
      console.log(`SERVING: ${filePath}`);
      res.type(contentType).sendFile(filePath);
    } else {
      console.error(`MISSING: ${filePath}`);
      res.status(404).send(`File not found at: ${filePath}`);
    }
  };
};

// 4. Explicit routes for ALL static files
app.get('/styles.css', serveStaticFile(
  path.join(staticDir, 'styles.css'),
  'text/css'
));

app.get('/images/logo.png', serveStaticFile(
  path.join(imagesDir, 'logo.png'),
  'image/png'
));

app.get('/images/hero-bg.jpg', serveStaticFile(
  path.join(imagesDir, 'hero-bg.jpg'),
  'image/jpeg'
));

// 5. Ultimate test route
app.get('/file-debug', (req, res) => {
  const files = {
    css: path.join(staticDir, 'styles.css'),
    logo: path.join(imagesDir, 'logo.png'),
    hero: path.join(imagesDir, 'hero-bg.jpg')
  };

  const results = Object.entries(files).map(([name, path]) => ({
    name,
    path,
    exists: fs.existsSync(path),
    url: `/${name === 'css' ? 'styles.css' : `images/${name}.${name === 'logo' ? 'png' : 'jpg'}`}`
  }));

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>File Debugger</title>
      <style>
        body { font-family: sans-serif; margin: 2rem; }
        .file { margin: 1rem 0; padding: 1rem; border: 1px solid #ccc; }
        .exists { color: green; }
        .missing { color: red; }
        img { max-width: 200px; display: block; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <h1>File Debugger</h1>
      ${results.map(file => `
        <div class="file">
          <h2>${file.name}</h2>
          <p>Path: <code>${file.path}</code></p>
          <p>Status: <span class="${file.exists ? 'exists' : 'missing'}">
            ${file.exists ? 'EXISTS' : 'MISSING'}
          </span></p>
          ${file.exists ? `
            <p>Link: <a href="${file.url}" target="_blank">${file.url}</a></p>
            ${file.name !== 'css' ? `<img src="${file.url}?t=${Date.now()}" alt="${file.name}">` : ''}
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `);
});

// =============================================
// MIDDLEWARE SETUP
// =============================================
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// =============================================
// CORE MIDDLEWARE 
// =============================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-32-chars-min",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Template variables middleware
app.use((req, res, next) => {
  res.locals = {
    user: req.session.user,
    currentPath: req.path,
    isLoginPage: req.path === '/login',
    isRegisterPage: req.path === '/register',
    isDashboardPage: req.path === '/dashboard'
  };
  next();
});

// ==============
// ROUTES
// ==============

// Database Test Route (enhanced)
app.get('/test-db', async (req, res) => {
  try {
    // Test basic query
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    
    // Get MySQL version
    const [version] = await pool.query('SELECT VERSION() AS version');
    
    // Check users table structure
    const [usersColumns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbConfig.database]);

    res.send(`
      <h1>Database Connection Test</h1>
      <p>1 + 1 = ${rows[0].result}</p>
      <p>MySQL Version: ${version[0].version}</p>
      <h2>Users Table Structure</h2>
      <pre>${JSON.stringify(usersColumns, null, 2)}</pre>
      <p>Connection config: ${JSON.stringify(dbConfig)}</p>
    `);
  } catch (err) {
    res.status(500).send(`
      <h1>Database Error</h1>
      <h2>${err.message}</h2>
      <h3>Error code: ${err.code}</h3>
      <pre>${err.stack}</pre>
      <p>Connection config: ${JSON.stringify(dbConfig)}</p>
    `);
  }
});

// Home Route
app.get("/", async (req, res) => {
  try {
    const [featuredItems] = await pool.query(
      "SELECT * FROM menu_items WHERE featured = TRUE LIMIT 3"
    ).catch(() => [[]]);
    
    res.render("index", { 
      title: "BookIt Restaurant",
      featuredItems,
      currentPath: req.path
    });
  } catch (err) {
    console.error("Home route error:", err);
    res.render("index", { 
      title: "BookIt Restaurant",
      featuredItems: [],
      currentPath: req.path
    });
  }
});

// Auth Routes
app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("login", { 
    title: "Login",
    error: req.query.error,
    success: req.query.registered ? "Registration successful! Please login" : null,
    currentPath: req.path
  });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ?", 
      [email]
    );
    
    if (!users.length || !(await bcrypt.compare(password, users[0].password))) {
      return res.redirect("/login?error=Invalid credentials");
    }

    req.session.user = {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email
    };

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.redirect("/login?error=Login failed");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.render("register", { 
    title: "Register",
    currentPath: req.path
  });
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Validate inputs
    if (!name || !email || !password) {
      return res.render("register", {
        error: "All fields are required",
        formData: req.body,
        currentPath: req.path
      });
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.render("register", {
        error: "Invalid email format",
        formData: req.body,
        currentPath: req.path
      });
    }

    // Password length validation
    if (password.length < 8) {
      return res.render("register", {
        error: "Password must be at least 8 characters",
        formData: req.body,
        currentPath: req.path
      });
    }

    // Check if email exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.render("register", {
        error: "Email already registered",
        formData: req.body,
        currentPath: req.path
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    
    res.redirect("/login?registered=true");
  } catch (err) {
    console.error("Registration error:", {
      message: err.message,
      code: err.code,
      sql: err.sql,
      sqlMessage: err.sqlMessage
    });
    
    let errorMessage = "Registration failed";
    if (err.code === 'ER_DUP_ENTRY') {
      errorMessage = "Email already exists";
    } else if (err.sqlMessage) {
      errorMessage = `Database error: ${err.sqlMessage}`;
    }

    res.render("register", {
      error: errorMessage,
      formData: req.body,
      currentPath: req.path
    });
  }
});

// Dashboard Route
app.get("/dashboard", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  
  try {
    const [reservations] = await pool.query(
      `SELECT id, customer_name, reservation_date, reservation_time, 
       number_of_guests, phone_number, special_requests 
       FROM reservations WHERE user_id = ? 
       ORDER BY reservation_date DESC, reservation_time DESC`,
      [req.session.user.id]
    );

    res.render("dashboard", { 
      title: "Dashboard",
      reservations: reservations || [],
      currentPath: req.path
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.render("dashboard", {
      title: "Dashboard",
      reservations: [],
      currentPath: req.path
    });
  }
});

// Menu Route
app.get("/menu", (req, res) => {
  try {
    // Hardcoded menu data
    const menuData = {
      categories: [
        {
          name: "Starters",
          items: [
            { name: "Garlic Bread", price: 5.99, desc: "Freshly baked with herbs" },
            { name: "Soup of the Day", price: 6.99, desc: "Chef's seasonal selection" }
          ]
        },
        {
          name: "Main Courses",
          items: [
            { name: "Spaghetti Bolognese", price: 14.99, desc: "Classic Italian pasta" },
            { name: "Grilled Salmon", price: 18.99, desc: "With lemon butter sauce" }
          ]
        }
      ]
    };

    res.render("menu", { 
      title: "Our Menu",
      menu: menuData,
      currentPath: req.path
    });
    
  } catch (err) {
    console.error("Menu error:", err);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Failed to load menu. Please try again later."
    });
  }
});

// Reservation Routes
app.get("/reserve", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("reserve", { 
    title: "Make Reservation",
    currentPath: req.path
  });
});

app.post("/reserve", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  try {
    const { customer_name, reservation_date, reservation_time, number_of_guests, phone_number, special_requests } = req.body;
    
    await pool.query(
      `INSERT INTO reservations 
       (user_id, customer_name, reservation_date, reservation_time, 
        number_of_guests, phone_number, special_requests) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.user.id,
        customer_name,
        reservation_date,
        reservation_time,
        number_of_guests,
        phone_number,
        special_requests || null
      ]
    );
    
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Reservation error:", err);
    res.render("reserve", {
      title: "Make Reservation",
      error: "Failed to make reservation",
      formData: req.body,
      currentPath: req.path
    });
  }
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error("Logout error:", err);
    res.redirect("/");
  });
});

// =============================================
// ERROR HANDLING
// =============================================
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Not Found",
    message: "The page you requested was not found"
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong on our end"
  });
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`
    ========================================
    SERVER RUNNING: http://localhost:${PORT}
    ========================================
    DEBUG MODE: ${DEBUG}
    STATIC FILES:
      - CSS: ${path.join(staticDir, 'styles.css')} → /styles.css
      - Logo: ${path.join(imagesDir, 'logo.png')} → /images/logo.png
      - Hero: ${path.join(imagesDir, 'hero-bg.jpg')} → /images/hero-bg.jpg
    
    TEST ENDPOINTS:
      - File Debugger: http://localhost:${PORT}/file-debug
    `);
  });
});