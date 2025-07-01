const notFound = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      health: '/health',
      auth: '/api/v1/auth',
      vendors: '/api/v1/vendors',
      payments: '/api/v1/payments'
    }
  });
};

module.exports = { notFound };
