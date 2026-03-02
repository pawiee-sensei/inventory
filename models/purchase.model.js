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
      s.name AS supplier_name,

      COUNT(poi.id) AS item_count,
      COALESCE(SUM(poi.quantity),0) AS total_qty

    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    LEFT JOIN purchase_order_items poi 
      ON poi.purchase_order_id = po.id

    GROUP BY po.id
    ORDER BY 
    po.status = 'RECEIVED', 
    po.created_at DESC
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

exports.receivePO = async (po_id) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [items] = await conn.query(`
      SELECT * FROM purchase_order_items WHERE purchase_order_id = ?
    `, [po_id]);

    for (const item of items) {

      // 1️⃣ Update product stock
      await conn.query(`
        UPDATE products 
        SET current_stock = current_stock + ?
        WHERE id = ?
      `, [item.quantity, item.product_id]);

      // 2️⃣ Insert stock movement
      await conn.query(`
        INSERT INTO stock_movements 
        (product_id, type, quantity, note)
        VALUES (?, 'IN', ?, 'PO Received')
      `, [item.product_id, item.quantity]);
    }

    // 3️⃣ Update PO status
    await conn.query(`
      UPDATE purchase_orders 
      SET status = 'RECEIVED'
      WHERE id = ?
    `, [po_id]);

    await conn.commit();
    conn.release();

  } catch (err) {
    await conn.rollback();
    conn.release();
    throw err;
  }
};

exports.getPODetails = async (id) => {
  const [[po]] = await db.query(`
    SELECT 
      po.id,
      po.status,
      po.total_cost,
      po.created_at,
      s.name AS supplier_name
    FROM purchase_orders po
    LEFT JOIN suppliers s ON po.supplier_id = s.id
    WHERE po.id = ?
  `,[id]);

  const [items] = await db.query(`
    SELECT 
      p.name,
      poi.quantity,
      poi.cost_price,
      (poi.quantity * poi.cost_price) AS subtotal
    FROM purchase_order_items poi
    JOIN products p ON poi.product_id = p.id
    WHERE poi.purchase_order_id = ?
  `,[id]);

  return { po, items };
};