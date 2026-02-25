const Stock = require('../models/stock.model');

exports.getHistory = async (req, res) => {
  const history = await Stock.getHistory();
  res.json(history);
};