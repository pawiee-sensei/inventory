const db = require('../db');

exports.generateSKU = async () => {
  const [rows] = await db.query('SELECT COUNT(*) as count FROM products');
  const next = rows[0].count + 1;
  return 'SKU-' + String(next).padStart(5, '0');
};


exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
  return rows;
};

exports.create = async (data) => {
  const {
    name,
    description,
    category,
    unit,
    cost_price,
    selling_price,
    min_stock_level,
    current_stock,
    image
  } = data;

  const sku = await exports.generateSKU();

  // ❗ we must capture result from query
  const [result] = await db.query(
    `INSERT INTO products 
    (name, sku, description, category, unit, cost_price, selling_price, min_stock_level, current_stock, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, sku, description, category, unit, cost_price, selling_price, min_stock_level, current_stock, image]
  );

  return result.insertId; // ← this line caused the crash earlier because result didn't exist
};



exports.findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
};

exports.update = async (id, data) => {
  const { name, description, category, unit, cost_price, selling_price, min_stock_level, image } = data;

  await db.query(
    `UPDATE products 
     SET name=?, description=?, category=?, unit=?, cost_price=?, selling_price=?, min_stock_level=?, image=COALESCE(?, image)
     WHERE id=?`,
    [name, description, category, unit, cost_price, selling_price, min_stock_level, image, id]
  );
};

exports.delete = async (id) => {
  // check stock
  const [rows] = await db.query(
    `SELECT current_stock FROM products WHERE id=?`,
    [id]
  );

  if (!rows.length) throw new Error('Product not found');

  if (rows[0].current_stock > 0) {
    throw new Error('Cannot delete product with stock remaining');
  }

  await db.query(`DELETE FROM products WHERE id=?`, [id]);
};
