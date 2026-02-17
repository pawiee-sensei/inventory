const db = require('../db');

exports.findByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM staff_users WHERE email = ?',
    [email]
  );
  return rows[0];
};
