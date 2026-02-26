const db = require('../db');

exports.getAll = async () => {
  const [rows] = await db.query(
    'SELECT * FROM suppliers ORDER BY created_at DESC'
  );
  return rows;
};

exports.create = async (data) => {
  const { name, contact_person, phone, email, address } = data;

  const [result] = await db.query(
    `INSERT INTO suppliers 
     (name, contact_person, phone, email, address)
     VALUES (?, ?, ?, ?, ?)`,
    [name, contact_person, phone, email, address]
  );

  return result.insertId;
};