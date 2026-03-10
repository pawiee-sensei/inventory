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

    // ✅ BASIC VALIDATION (ADD HERE)

    if (!name || !selling_price) {
      return res.status(400).json({
        success: false,
        message: 'Name and selling price are required'
      });
    }

    if (isNaN(Number(selling_price))) {
      return res.status(400).json({
        success: false,
        message: 'Selling price must be numeric'
      });
    }

    // Optional but recommended:
    if (Number(selling_price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Selling price cannot be negative'
      });
    }

    // ✅ CREATE AFTER VALIDATION
    await Product.create({
      name,
      description,
      category,
      unit,
      cost_price,
      selling_price: Number(selling_price),
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

const fs = require('fs');
const path = require('path');

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let image = existingProduct.image;

    // If new image uploaded
    if (req.file) {

      // Delete old image if exists
      if (existingProduct.image) {
        const oldPath = path.join(
          __dirname,
          '../../public/uploads',
          existingProduct.image
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      image = req.file.filename;
    }

    await Product.update(id, { ...req.body, image });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.delete(id);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.deleteProduct = async (req,res)=>{

  await Product.delete(req.params.id);

  res.json({ success:true });

};