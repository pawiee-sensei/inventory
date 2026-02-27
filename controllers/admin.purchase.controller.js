const Supplier = require('../models/supplier.model');
const Purchase = require('../models/purchase.model');

exports.getSuppliers = async (req, res) => {
  const suppliers = await Supplier.getAll();
  res.json(suppliers);
};

exports.createSupplier = async (req, res) => {
  const id = await Supplier.create(req.body);
  res.json({ success: true, id });
};

exports.createPO = async (req, res) => {
  const { supplier_id } = req.body;
  const id = await Purchase.createPO(supplier_id);
  res.json({ success: true, id });
};

exports.addItem = async (req, res) => {
  const { po_id, product_id, quantity, cost_price } = req.body;
  await Purchase.addItem(po_id, product_id, quantity, cost_price);
  res.json({ success: true });
};

exports.getAllPO = async (req, res) => {
  const data = await Purchase.getAllPO();
  res.json(data);
};

exports.getProducts = async (req,res)=>{
  const rows = await Purchase.getProducts();
  res.json(rows);
};

exports.getPOItems = async (req,res)=>{
  const rows = await Purchase.getPOItems(req.params.id);
  res.json(rows);
};