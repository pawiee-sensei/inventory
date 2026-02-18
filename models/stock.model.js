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
