import { Router } from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { StripeService } from '../services/stripe.service';

const router = Router();

// All routes require admin access
router.use(adminMiddleware);

// Dashboard KPIs
router.get('/dashboard', asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '24h':
      startDate.setHours(now.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  const [
    totalUsers,
    totalDrivers,
    activeDrivers,
    totalRides,
    completedRides,
    totalRevenue,
    todayRides,
    todayRevenue,
    recentTransactions,
    pendingDrivers,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Total drivers
    prisma.driver.count(),
    
    // Active drivers (approved and background checked)
    prisma.driver.count({
      where: { isApproved: true, backgroundCheck: true },
    }),
    
    // Total rides
    prisma.ride.count(),
    
    // Completed rides in period
    prisma.ride.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
    }),
    
    // Total revenue from completed rides
    prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        ride: {
          status: 'COMPLETED',
        },
      },
      _sum: { amount: true },
    }),
    
    // Today's rides
    prisma.ride.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    }),
    
    // Today's revenue
    prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        paidAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
      _sum: { amount: true },
    }),
    
    // Recent transactions
    prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ride: {
          select: {
            id: true,
            pickupAddress: true,
            dropoffAddress: true,
          },
        },
      },
    }),
    
    // Pending driver approvals
    prisma.driver.count({
      where: {
        isApproved: false,
        backgroundCheck: true,
      },
    }),
  ]);

  // Calculate growth metrics
  const previousPeriodStart = new Date(startDate);
  const previousPeriodEnd = new Date();
  
  const [prevRides, prevRevenue] = await Promise.all([
    prisma.ride.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'SUCCEEDED',
        ride: {
          status: 'COMPLETED',
        },
        paidAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const rideGrowth = prevRides > 0 ? ((completedRides - prevRides) / prevRides) * 100 : 0;
  const revenueGrowth = prevRevenue._sum.amount > 0 ? 
    (((totalRevenue._sum.amount || 0) - prevRevenue._sum.amount) / prevRevenue._sum.amount) * 100 : 0;

  res.json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        totalDrivers,
        activeDrivers,
        totalRides,
        completedRides,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayRides,
        todayRevenue: todayRevenue._sum.amount || 0,
        pendingDrivers,
      },
      growth: {
        rides: rideGrowth,
        revenue: revenueGrowth,
      },
      recentTransactions,
    },
  });
}));

// Get users with search and filtering
router.get('/users', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    isActive, 
    isAdmin,
    dateFrom,
    dateTo,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
      { phone: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  
  if (isAdmin !== undefined) {
    where.isAdmin = isAdmin === 'true';
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
    if (dateTo) where.createdAt.lte = new Date(dateTo as string);
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            rides: true,
            paymentMethods: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

// Get drivers with search and filtering
router.get('/drivers', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    isApproved,
    backgroundCheck,
    dateFrom,
    dateTo,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (search) {
    where.OR = [
      { user: { name: { contains: search as string, mode: 'insensitive' } } },
      { user: { email: { contains: search as string, mode: 'insensitive' } } },
      { licenseNumber: { contains: search as string } },
      { vehiclePlate: { contains: search as string } },
    ];
  }
  
  if (isApproved !== undefined) {
    where.isApproved = isApproved === 'true';
  }
  
  if (backgroundCheck !== undefined) {
    where.backgroundCheck = backgroundCheck === 'true';
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
    if (dateTo) where.createdAt.lte = new Date(dateTo as string);
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.driver.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      drivers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

// Get rides with search and filtering
router.get('/rides', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status,
    dateFrom,
    dateTo,
    search,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
    if (dateTo) where.createdAt.lte = new Date(dateTo as string);
  }
  
  if (search) {
    where.OR = [
      { pickupAddress: { contains: search as string, mode: 'insensitive' } },
      { dropoffAddress: { contains: search as string, mode: 'insensitive' } },
      { user: { name: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ride.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      rides,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

// Get payments with search and filtering
router.get('/payments', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status,
    dateFrom,
    dateTo,
    search,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
    if (dateTo) where.createdAt.lte = new Date(dateTo as string);
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        ride: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

// Get transactions
router.get('/transactions', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    type,
    status,
    dateFrom,
    dateTo,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = {};
  
  if (type) {
    where.type = type;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
    if (dateTo) where.createdAt.lte = new Date(dateTo as string);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ride: {
          select: {
            id: true,
            pickupAddress: true,
            dropoffAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
}));

// Get revenue analytics
router.get('/revenue', asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  const now = new Date();
  let groupBy = 'day';
  let startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      groupBy = 'day';
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      groupBy = 'day';
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      groupBy = 'week';
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      groupBy = 'month';
      break;
    default:
      startDate.setDate(now.getDate() - 30);
      groupBy = 'day';
  }

  // Get revenue data
  const revenueData = await prisma.payment.findMany({
    where: {
      status: 'SUCCEEDED',
      paidAt: { gte: startDate },
    },
    select: {
      amount: true,
      paidAt: true,
      currency: true,
    },
  });

  // Group by period
  const groupedData = revenueData.reduce((acc: any, payment) => {
    const date = new Date(payment.paidAt!);
    let key: string;
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    if (!acc[key]) {
      acc[key] = { amount: 0, count: 0 };
    }
    acc[key].amount += payment.amount;
    acc[key].count += 1;
    
    return acc;
  }, {});

  const chartData = Object.entries(groupedData).map(([date, data]) => ({
    date,
    revenue: data.amount,
    transactionCount: data.count,
  })).sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    success: true,
    data: {
      chartData,
      summary: {
        totalRevenue: revenueData.reduce((sum, p) => sum + p.amount, 0),
        totalTransactions: revenueData.length,
        averageTransaction: revenueData.length > 0 ? 
          revenueData.reduce((sum, p) => sum + p.amount, 0) / revenueData.length : 0,
      },
    },
  });
}));

// Approve/reject driver
router.patch('/drivers/:id/approve', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  if (typeof isApproved !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isApproved must be a boolean',
    });
  }

  const driver = await prisma.driver.update({
    where: { id },
    data: { isApproved },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: { driver },
    message: `Driver ${isApproved ? 'approved' : 'rejected'} successfully`,
  });
}));

// Deactivate/activate user
router.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be a boolean',
    });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: { user },
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
  });
}));

// Refund payment
router.post('/payments/:id/refund', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { ride: true },
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found',
    });
  }

  try {
    // Process refund with Stripe
    const refund = await StripeService.refundPayment(
      payment.stripePaymentIntentId,
      amount,
      reason
    );

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundAmount: amount || payment.amount,
      },
    });

    // Create refund transaction record
    await prisma.transaction.create({
      data: {
        userId: payment.userId,
        rideId: payment.rideId,
        type: 'REFUND',
        stripeTransactionId: refund.id,
        amount: -Math.abs(amount || payment.amount),
        status: 'SUCCEEDED',
        description: `Admin refund: ${reason || 'No reason provided'}`,
      },
    });

    res.json({
      success: true,
      data: { 
        payment: updatedPayment,
        refund,
      },
      message: 'Refund processed successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Refund processing failed',
    });
  }
}));

export default router;