const Dashboard = require('../models/dashboard.model');

exports.getMetrics = async (req, res) => {
  const metrics = await Dashboard.getMetrics();
  res.json(metrics);
};