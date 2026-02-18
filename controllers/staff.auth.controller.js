const bcrypt = require('bcrypt');
const Staff = require('../models/staff.model');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const staff = await Staff.findByEmail(email);
  if (!staff) {
    return res.status(401).send('Invalid credentials');
  }

  const match = await bcrypt.compare(password, staff.password);
  if (!match) {
    return res.status(401).send('Invalid credentials');
  }

  req.session.staff = {
    id: staff.id,
    name: staff.name,
    email: staff.email
  };

  const isBrowser = req.headers.accept && req.headers.accept.includes('text/html');

  if (isBrowser) {
    return res.redirect('/staff/dashboard');
  }

  res.json({ message: 'Staff logged in' });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Staff logged out' });
  });
};
