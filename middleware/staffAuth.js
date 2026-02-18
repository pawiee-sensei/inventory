module.exports = (req, res, next) => {
  if (!req.session.staff) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ message: 'Staff not authenticated' });
    }
    return res.redirect('/staff/login');
  }
  next();
};
