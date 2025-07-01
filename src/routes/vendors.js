const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const {
  createVendorValidation,
  updateVendorValidation,
  idValidation,
  paginationValidation,
  handleValidationErrors,
} = require('../middleware/validation');

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication to all vendor routes
router.use(authenticateToken);

// GET /vendors - List all vendors with pagination
router.get('/', paginationValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;

    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) {
      where.status = status.toUpperCase();
    }

    // Get vendors with pagination
    const [vendors, totalCount] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { payments: true }
          }
        }
      }),
      prisma.vendor.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      message: 'Vendors retrieved successfully',
      data: vendors,
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

// POST /vendors - Create a new vendor
router.post('/', createVendorValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { name, email, phone, address, contactName, status = 'ACTIVE' } = req.body;

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone,
        address,
        contactName,
        status: status.toUpperCase()
      }
    });

    res.status(201).json({
      message: 'Vendor created successfully',
      data: vendor
    });
  } catch (error) {
    next(error);
  }
});

// GET /vendors/:id - Get vendor details
router.get('/:id', idValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Latest 10 payments
        },
        _count: {
          select: { payments: true }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found',
        message: 'The requested vendor does not exist'
      });
    }

    // Calculate payment statistics
    const paymentStats = await prisma.payment.aggregate({
      where: { vendorId: id },
      _sum: { amount: true },
      _count: { _all: true }
    });

    const paidPayments = await prisma.payment.aggregate({
      where: { vendorId: id, status: 'PAID' },
      _sum: { amount: true },
      _count: { _all: true }
    });

    const pendingPayments = await prisma.payment.aggregate({
      where: { vendorId: id, status: 'PENDING' },
      _sum: { amount: true },
      _count: { _all: true }
    });

    res.json({
      message: 'Vendor details retrieved successfully',
      data: {
        ...vendor,
        statistics: {
          totalPayments: paymentStats._count._all || 0,
          totalAmount: paymentStats._sum.amount || 0,
          paidPayments: paidPayments._count._all || 0,
          paidAmount: paidPayments._sum.amount || 0,
          pendingPayments: pendingPayments._count._all || 0,
          pendingAmount: pendingPayments._sum.amount || 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /vendors/:id - Update vendor
router.put('/:id', updateVendorValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert status to uppercase if provided
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /vendors/:id - Delete vendor
router.delete('/:id', idValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if vendor has payments
    const paymentCount = await prisma.payment.count({
      where: { vendorId: id }
    });

    if (paymentCount > 0) {
      return res.status(409).json({
        error: 'Cannot delete vendor',
        message: `Vendor has ${paymentCount} associated payment(s). Please delete or reassign payments first.`
      });
    }

    await prisma.vendor.delete({
      where: { id }
    });

    res.json({
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
