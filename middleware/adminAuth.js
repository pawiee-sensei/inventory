module.exports = (req, res, next) => {
  if (!req.session.admin) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ message: 'Admin not authenticated' });
    }
    return res.redirect('/admin/login');
  }
  next();
};
