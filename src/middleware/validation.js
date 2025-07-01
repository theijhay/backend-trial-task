const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
];

const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Vendor validation rules
const createVendorValidation = [
  body('name')
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage('Vendor name is required and must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('contactName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact name must be between 2 and 100 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, SUSPENDED'),
];

const updateVendorValidation = [
  param('id')
    .notEmpty()
    .withMessage('Vendor ID is required'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Vendor name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('contactName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Contact name must be between 2 and 100 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, SUSPENDED'),
];

// Payment validation rules
const createPaymentValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('vendorId')
    .notEmpty()
    .withMessage('Vendor ID is required'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date in ISO 8601 format'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date in ISO 8601 format'),
  body('status')
    .optional()
    .isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
    .withMessage('Status must be one of: PENDING, PAID, OVERDUE, CANCELLED'),
];

const updatePaymentValidation = [
  param('id')
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date in ISO 8601 format'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date in ISO 8601 format'),
  body('status')
    .optional()
    .isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
    .withMessage('Status must be one of: PENDING, PAID, OVERDUE, CANCELLED'),
];

// Common validation rules
const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required'),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  createVendorValidation,
  updateVendorValidation,
  createPaymentValidation,
  updatePaymentValidation,
  idValidation,
  paginationValidation,
};
