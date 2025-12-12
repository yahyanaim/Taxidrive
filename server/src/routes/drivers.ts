import { Router } from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { StripeService } from '../services/stripe.service';

const router = Router();

// Register as driver
router.post('/register', authMiddleware, asyncHandler(async (req: any, res) => {
  const driverSchema = z.object({
    licenseNumber: z.string().min(5),
    licenseExpiry: z.string().datetime(),
    vehicleMake: z.string(),
    vehicleModel: z.string(),
    vehicleYear: z.number().int().min(1990).max(new Date().getFullYear() + 1),
    vehiclePlate: z.string(),
    vehicleColor: z.string(),
    insuranceNumber: z.string(),
    insuranceExpiry: z.string().datetime(),
  });

  const data = driverSchema.parse(req.body);

  // Check if user is already a driver
  const existingDriver = await prisma.driver.findUnique({
    where: { userId: req.user.id },
  });

  if (existingDriver) {
    return res.status(400).json({
      success: false,
      message: 'User is already registered as a driver',
    });
  }

  // Create Stripe Connect account for the driver
  const stripeAccount = await StripeService.createConnectAccount(req.user.email);

  const driver = await prisma.driver.create({
    data: {
      userId: req.user.id,
      licenseNumber: data.licenseNumber,
      licenseExpiry: new Date(data.licenseExpiry),
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      vehiclePlate: data.vehiclePlate,
      vehicleColor: data.vehicleColor,
      insuranceNumber: data.insuranceNumber,
      insuranceExpiry: new Date(data.insuranceExpiry),
      stripeAccountId: stripeAccount.id,
    },
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

  res.status(201).json({
    success: true,
    data: { driver },
    message: 'Driver registration submitted for approval',
  });
}));

// Get driver's own profile
router.get('/me', authMiddleware, asyncHandler(async (req: any, res) => {
  const driver = await prisma.driver.findUnique({
    where: { userId: req.user.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        },
      },
      rides: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          pickupAddress: true,
          dropoffAddress: true,
          totalFare: true,
          status: true,
          startedAt: true,
          completedAt: true,
        },
      },
      payouts: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!driver) {
    return res.status(404).json({
      success: false,
      message: 'Driver not found',
    });
  }

  res.json({
    success: true,
    data: { driver },
  });
}));

// Get all drivers (admin only)
router.get('/', adminMiddleware, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    isApproved,
    backgroundCheck 
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

// Get pending approval drivers (admin only)
router.get('/pending-approval', adminMiddleware, asyncHandler(async (req, res) => {
  const drivers = await prisma.driver.findMany({
    where: { 
      isApproved: false,
      backgroundCheck: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  res.json({
    success: true,
    data: { drivers },
  });
}));

// Get driver by ID
router.get('/:id', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;

  const driver = await prisma.driver.findUnique({
    where: { id },
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
      rides: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      payouts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!driver) {
    return res.status(404).json({
      success: false,
      message: 'Driver not found',
    });
  }

  // Non-admin users can only access their own driver profile
  if (!req.user.isAdmin && driver.userId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  res.json({
    success: true,
    data: { driver },
  });
}));

// Approve/reject driver (admin only)
router.patch('/:id/approve', adminMiddleware, asyncHandler(async (req, res) => {
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

// Update driver background check status (admin only)
router.patch('/:id/background-check', adminMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { backgroundCheck } = req.body;

  if (typeof backgroundCheck !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'backgroundCheck must be a boolean',
    });
  }

  const driver = await prisma.driver.update({
    where: { id },
    data: { backgroundCheck },
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
    message: `Driver background check ${backgroundCheck ? 'completed' : 'pending'}`,
  });
}));

// Create Stripe Connect account link for driver onboarding
router.post('/:id/account-link', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;

  const driver = await prisma.driver.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!driver) {
    return res.status(404).json({
      success: false,
      message: 'Driver not found',
    });
  }

  if (!driver.stripeAccountId) {
    return res.status(400).json({
      success: false,
      message: 'Driver does not have a Stripe account',
    });
  }

  // Only the driver themselves or admin can create account link
  if (driver.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  const accountLink = await StripeService.createAccountLink(
    driver.stripeAccountId,
    `${process.env.CLIENT_URL}/driver/onboarding/return`,
    `${process.env.CLIENT_URL}/driver/onboarding/refresh`
  );

  res.json({
    success: true,
    data: { url: accountLink.url },
  });
}));

export default router;