const Product = require('../models/product.model');

// GET ALL PRODUCTS
exports.getAll = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// CREATE PRODUCT (WITH IMAGE)
exports.create = async (req, res) => {
  try {
    // multer now guarantees req.body exists
    const body = req.body || {};

    const name = body.name;
    const description = body.description;
    const category = body.category;
    const unit = body.unit;
    const cost_price = body.cost_price;
    const selling_price = body.selling_price;
    const min_stock_level = body.min_stock_level;
    const current_stock = parseInt(body.current_stock) || 0;
    const image = req.file ? req.file.filename : null;

    await Product.create({
      name,
      description,
      category,
      unit,
      cost_price,
      selling_price,
      min_stock_level,
      current_stock,
      image
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (req.file) {
      data.image = req.file.filename;
    }

    await Product.update(id, data);

    res.redirect('/admin/products');
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.delete(id);
    res.redirect('/admin/products');
  } catch (err) {
    res.status(400).send(err.message);
  }
};
