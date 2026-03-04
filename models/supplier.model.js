const db = require('../db');

exports.getAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      s.id,
      s.name,
      s.contact_person,
      s.phone,
      s.email,
      s.address,
      COUNT(po.id) AS total_po
    FROM suppliers s
    LEFT JOIN purchase_orders po 
      ON po.supplier_id = s.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `);

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