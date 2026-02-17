const bcrypt = require('bcrypt');
const Admin = require('../models/admin.model');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findByEmail(email);
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.admin = {
    id: admin.id,
    name: admin.name,
    email: admin.email
  };

  res.json({ message: 'Admin logged in' });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Admin logged out' });
  });
};
