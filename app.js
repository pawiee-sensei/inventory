require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');

const app = express();

// =============================
// HELMET (KEEP AS IS)
// =============================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "http://localhost:5173"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "http://localhost:5173"],
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
// STATIC FILES (IMPORTANT)
// =============================
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================
// VIEW ENGINE
// =============================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =============================
// SESSION
// =============================
app.use(
  session({
    name: 'inventory_session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

//
// ===== ROUTES (ORDER MATTERS) =====
//

// Auth API
app.use('/api/admin/auth', require('./routes/admin.auth.routes'));
app.use('/api/staff/auth', require('./routes/staff.auth.routes'));

// Auth Pages (login screens)
app.use('/', require('./routes/auth.views.routes'));

// Admin & Staff protected pages
app.use('/admin', require('./routes/admin.protected.routes'));
app.use('/staff', require('./routes/staff.protected.routes'));

// Admin & Staff UI pages
app.use('/admin', require('./routes/admin.views.routes'));
app.use('/staff', require('./routes/staff.views.routes'));

// Inventory API
app.use('/api/admin/products', require('./routes/admin.product.routes'));
app.use('/api/staff/stock', require('./routes/staff.stock.routes'));

// Test route
app.get('/', (req, res) => {
  res.send('Smart Inventory API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
