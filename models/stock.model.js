const db = require('../db');

exports.addMovement = async ({ product_id, staff_user_id, type, quantity, note }) => {
  await db.query(
    `INSERT INTO stock_movements (product_id, staff_user_id, type, quantity, note)
     VALUES (?, ?, ?, ?, ?)`,
    [product_id, staff_user_id, type, quantity, note]
  );
};

exports.updateStock = async (product_id, quantityChange) => {
  await db.query(
    `UPDATE products 
     SET current_stock = current_stock + ?
     WHERE id = ?`,
    [quantityChange, product_id]
  );
};


exports.getHistory = async () => {
  const [rows] = await db.query(`
    SELECT 
      sm.id,
      sm.type,
      sm.quantity,
      sm.note,
      sm.created_at,
      p.name AS product_name,
      su.name AS staff_name
    FROM stock_movements sm
    LEFT JOIN products p ON sm.product_id = p.id
    LEFT JOIN staff_users su ON sm.staff_user_id = su.id
    ORDER BY sm.created_at DESC
  `);

  return rows;
};

exports.adjustStock = async ({product_id, quantity, reason}) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // update stock
    await conn.query(`
      UPDATE products 
      SET current_stock = current_stock + ?
      WHERE id = ?
    `,[quantity, product_id]);

    // log movement
    await conn.query(`
      INSERT INTO stock_movements 
      (product_id, type, quantity, note)
      VALUES (?, 'ADJUSTMENT', ?, ?)
    `,[product_id, quantity, reason]);

    await conn.commit();
    conn.release();
  } catch(err){
    await conn.rollback();
    conn.release();
    throw err;
  }
};