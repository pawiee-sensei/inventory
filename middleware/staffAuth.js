module.exports = (req, res, next) => {
  if (!req.session.staff) {
    return res.status(401).json({ message: 'Staff not authenticated' });
  }
  next();
};
