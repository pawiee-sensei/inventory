const db = require('../db');

exports.getMetrics = async () => {
  const [[total]] = await db.query(
    `SELECT COUNT(*) as total FROM products`
  );

  const [[out]] = await db.query(
    `SELECT COUNT(*) as count FROM products WHERE current_stock = 0`
  );

  const [[low]] = await db.query(
    `SELECT COUNT(*) as count FROM products 
     WHERE current_stock > 0 AND current_stock <= min_stock_level`
  );

  const [[healthy]] = await db.query(
    `SELECT COUNT(*) as count FROM products 
     WHERE current_stock > min_stock_level`
  );

  const [[value]] = await db.query(
    `SELECT SUM(current_stock * cost_price) as totalValue FROM products`
  );

  return {
    total: total.total,
    out: out.count,
    low: low.count,
    healthy: healthy.count,
    value: value.totalValue || 0
  };
};