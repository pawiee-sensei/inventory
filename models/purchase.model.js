const db = require('../db');

exports.createPO = async (supplier_id) => {
  const [result] = await db.query(
    `INSERT INTO purchase_orders (supplier_id, total_cost)
     VALUES (?, 0)`,
    [supplier_id]
  );

  return result.insertId;
};

exports.addItem = async (po_id, product_id, quantity, cost_price) => {
  await db.query(
    `INSERT INTO purchase_order_items 
     (purchase_order_id, product_id, quantity, cost_price)
     VALUES (?, ?, ?, ?)`,
    [po_id, product_id, quantity, cost_price]
  );

  await db.query(
    `UPDATE purchase_orders 
     SET total_cost = total_cost + (? * ?)
     WHERE id = ?`,
    [quantity, cost_price, po_id]
  );
};

exports.getAllPO = async () => {
  const [rows] = await db.query(`
    SELECT 
      po.id,
      po.status,
      po.total_cost,
      po.created_at,
      s.name AS supplier_name
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    ORDER BY po.created_at DESC
  `);


  
  return rows;
};

exports.getPOItems = async (po_id) => {
  const [rows] = await db.query(`
    SELECT 
      poi.product_id,
      poi.quantity,
      poi.cost_price,
      p.name AS product_name
    FROM purchase_order_items poi
    JOIN products p ON poi.product_id = p.id
    WHERE poi.purchase_order_id = ?
  `, [po_id]);

  return rows;
};

exports.getProducts = async () => {
  const [rows] = await db.query(
    'SELECT id,name FROM products ORDER BY name'
  );
  return rows;
};