const Stock = require('../models/stock.model');
const Product = require('../models/product.model');

exports.stockIn = async (req, res) => {
  const { product_id, quantity, note } = req.body;

  await Stock.updateStock(product_id, quantity);

  await Stock.addMovement({
    product_id,
    staff_user_id: req.session.staff.id,
    type: 'IN',
    quantity,
    note
  });

  res.json({ message: 'Stock added' });
};

exports.stockOut = async (req, res) => {
  const { product_id, quantity, note } = req.body;

  const product = await Product.findById(product_id);
  if (product.current_stock < quantity) {
    return res.status(400).json({ message: 'Not enough stock' });
  }

  await Stock.updateStock(product_id, -quantity);

  await Stock.addMovement({
    product_id,
    staff_user_id: req.session.staff.id,
    type: 'OUT',
    quantity,
    note
  });

  res.json({ message: 'Stock removed' });
};
