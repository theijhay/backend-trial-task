const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const {
  createPaymentValidation,
  updatePaymentValidation,
  idValidation,
  vendorIdValidation,
  paginationValidation,
  handleValidationErrors,
} = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all payment routes
router.use(authenticateToken);

// GET /payments - List all payments with pagination and filtering
router.get('/', paginationValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const vendorId = req.query.vendorId;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    // Build where clause
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (vendorId) {
      where.vendorId = vendorId;
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get payments with pagination
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Calculate summary statistics
    const summary = await prisma.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: { _all: true }
    });

    res.json({
      message: 'Payments retrieved successfully',
      data: payments,
      summary: {
        totalPayments: summary._count._all || 0,
        totalAmount: summary._sum.amount || 0
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /payments - Create a new payment
router.post('/', createPaymentValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { amount, description, vendorId, dueDate, paymentDate, status = 'PENDING' } = req.body;

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'The specified vendor does not exist'
      });
    }

    if (vendor.status !== 'ACTIVE') {
      return res.status(400).json({
        error: 'Inactive vendor',
        message: 'Cannot create payment for inactive vendor'
      });
    }

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        description,
        vendorId,
        dueDate: dueDate ? new Date(dueDate) : null,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        status: status.toUpperCase()
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

// GET /payments/vendor/:vendorId - Get payments by vendor
router.get('/vendor/:vendorId', vendorIdValidation, paginationValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true, email: true, status: true }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'The specified vendor does not exist'
      });
    }

    // Build where clause
    const where = { vendorId };
    if (status) {
      where.status = status.toUpperCase();
    }

    // Get payments for the vendor
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Calculate summary for this vendor
    const summary = await prisma.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: { _all: true }
    });

    res.json({
      message: 'Vendor payments retrieved successfully',
      vendor,
      data: payments,
      summary: {
        totalPayments: summary._count._all || 0,
        totalAmount: summary._sum.amount || 0
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /payments/:id - Get payment details
router.get('/:id', idValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            contactName: true,
            status: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found',
        message: 'The requested payment does not exist'
      });
    }

    res.json({
      message: 'Payment details retrieved successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

// PUT /payments/:id - Update payment
router.put('/:id', updatePaymentValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert dates and status
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.paymentDate) {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }
    if (updateData.amount) {
      updateData.amount = parseFloat(updateData.amount);
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /payments/:id - Delete payment
router.delete('/:id', idValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.payment.delete({
      where: { id }
    });

    res.json({
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /payments/stats/overview - Get payment statistics (bonus endpoint)
router.get('/stats/overview', async (req, res, next) => {
  try {
    const [
      totalStats,
      paidStats,
      pendingStats,
      overdueStats,
      recentPayments
    ] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { _all: true }
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
        _count: { _all: true }
      }),
      prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: { _all: true }
      }),
      prisma.payment.aggregate({
        where: { status: 'OVERDUE' },
        _sum: { amount: true },
        _count: { _all: true }
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: {
            select: { name: true }
          }
        }
      })
    ]);

    res.json({
      message: 'Payment statistics retrieved successfully',
      data: {
        total: {
          count: totalStats._count._all || 0,
          amount: totalStats._sum.amount || 0
        },
        paid: {
          count: paidStats._count._all || 0,
          amount: paidStats._sum.amount || 0
        },
        pending: {
          count: pendingStats._count._all || 0,
          amount: pendingStats._sum.amount || 0
        },
        overdue: {
          count: overdueStats._count._all || 0,
          amount: overdueStats._sum.amount || 0
        },
        recentPayments
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
