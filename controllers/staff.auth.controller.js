const bcrypt = require('bcrypt');
const Staff = require('../models/staff.model');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const staff = await Staff.findByEmail(email);
  if (!staff) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, staff.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.staff = {
    id: staff.id,
    name: staff.name,
    email: staff.email
  };

  res.json({ message: 'Staff logged in' });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Staff logged out' });
  });
};
