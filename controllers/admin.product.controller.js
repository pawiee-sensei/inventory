const Product = require('../models/product.model');

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.image = req.file ? req.file.filename : null;

    await Product.create(data);

    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send(err.message);
  }
};


exports.getAll = async (req, res) => {
  const products = await Product.getAll();
  res.json(products);
};
