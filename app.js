require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');

const app = express();


// =============================
// HELMET SECURITY (STRICT CSP)
// =============================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "http://localhost:5173" // React dev server (future)
        ],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: [
          "'self'",
          "http://localhost:5173"
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  })
);


// =============================
// BODY PARSING
// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =============================
// VIEW ENGINE (TEMP AUTH UI)
// =============================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// =============================
// STATIC FILES
// =============================
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// =============================
// SESSION CONFIGURATION
// =============================
app.use(
  session({
    name: 'inventory_session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // will become true in production
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  })
);

const adminAuthRoutes = require('./routes/admin.auth.routes');
const staffAuthRoutes = require('./routes/staff.auth.routes');

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/staff/auth', staffAuthRoutes);

const authViewRoutes = require('./routes/auth.views.routes');
app.use('/', authViewRoutes);

const adminProtectedRoutes = require('./routes/admin.protected.routes');
const staffProtectedRoutes = require('./routes/staff.protected.routes');

app.use('/admin', adminProtectedRoutes);
app.use('/staff', staffProtectedRoutes);


// =============================
// TEST ROUTE
// =============================
app.get('/', (req, res) => {
  res.send('Smart Inventory API is running');
});


// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
