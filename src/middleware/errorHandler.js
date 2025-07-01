const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists',
      details: err.meta
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      message: 'The requested record does not exist'
    });
  }

  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Database error',
      message: 'An error occurred while processing your request',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid input data',
      details: err.details
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.status === 500 ? 'Internal server error' : 'Bad request',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
