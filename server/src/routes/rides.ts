import { Router } from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware, driverMiddleware } from '../middleware/auth';
import { StripeService } from '../services/stripe.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const router = Router();

// Create a new ride
router.post('/', authMiddleware, asyncHandler(async (req: any, res) => {
  const rideSchema = z.object({
    pickupAddress: z.string(),
    dropoffAddress: z.string(),
    pickupLat: z.number(),
    pickupLng: z.number(),
    dropoffLat: z.number(),
    dropoffLng: z.number(),
    distance: z.number().positive(),
    duration: z.number().int().positive(),
    fare: z.number().positive(),
    surgeMultiplier: z.number().default(1.0),
  });

  const data = rideSchema.parse(req.body);
  const totalFare = data.fare * data.surgeMultiplier;

  // Find available drivers (you'd implement actual driver matching logic here)
  const availableDriver = await prisma.driver.findFirst({
    where: {
      isApproved: true,
      backgroundCheck: true,
      user: { isActive: true },
    },
    orderBy: { rating: 'desc' },
  });

  if (!availableDriver) {
    return res.status(400).json({
      success: false,
      message: 'No available drivers',
    });
  }

  // Get user and ensure they have a Stripe customer
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user?.stripeCustomerId) {
    return res.status(400).json({
      success: false,
      message: 'User does not have a payment method on file',
    });
  }

  // Create Stripe payment intent
  const paymentIntent = await StripeService.createPaymentIntent(
    totalFare,
    'usd',
    user.stripeCustomerId,
    {
      userId: req.user.id,
      type: 'ride_payment',
    }
  );

  // Create ride with payment intent ID
  const ride = await prisma.ride.create({
    data: {
      userId: req.user.id,
      driverId: availableDriver.id,
      pickupAddress: data.pickupAddress,
      dropoffAddress: data.dropoffAddress,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      dropoffLat: data.dropoffLat,
      dropoffLng: data.dropoffLng,
      distance: data.distance,
      duration: data.duration,
      fare: data.fare,
      surgeMultiplier: data.surgeMultiplier,
      totalFare,
      paymentIntentId: paymentIntent.id,
      status: 'PENDING',
    },
    include: {
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
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      rideId: ride.id,
      userId: req.user.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: totalFare,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    success: true,
    data: {
      ride: {
        ...ride,
        clientSecret: paymentIntent.client_secret,
      },
    },
  });
}));

// Get rides for current user
router.get('/my-rides', authMiddleware, asyncHandler(async (req: any, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = { userId: req.user.id };
  
  if (status) {
    where.status = status;
  }

  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
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

// Get rides for driver
router.get('/driver-rides', authMiddleware, asyncHandler(async (req: any, res) => {
  const driver = await prisma.driver.findUnique({
    where: { userId: req.user.id },
  });

  if (!driver) {
    return res.status(404).json({
      success: false,
      message: 'Driver not found',
    });
  }

  const { 
    page = 1, 
    limit = 10, 
    status,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const where: any = { driverId: driver.id };
  
  if (status) {
    where.status = status;
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

// Get all rides (admin only)
router.get('/', adminMiddleware, asyncHandler(async (req, res) => {
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

// Get ride by ID
router.get('/:id', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;

  const ride = await prisma.ride.findUnique({
    where: { id },
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
  });

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found',
    });
  }

  // Check access permissions
  const hasAccess = req.user.isAdmin || 
    ride.userId === req.user.id || 
    (ride.driver && ride.driver.userId === req.user.id);

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  res.json({
    success: true,
    data: { ride },
  });
}));

// Update ride status (driver or admin)
router.patch('/:id/status', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }

  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { driver: true },
  });

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found',
    });
  }

  // Check permissions
  const isDriverOfRide = ride.driver?.userId === req.user.id;
  if (!req.user.isAdmin && !isDriverOfRide) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  const updateData: any = { status };
  
  if (status === 'IN_PROGRESS') {
    updateData.startedAt = new Date();
  } else if (status === 'COMPLETED') {
    updateData.completedAt = new Date();
  } else if (status === 'CANCELLED') {
    updateData.cancelledAt = new Date();
    updateData.cancellationReason = reason;
  }

  const updatedRide = await prisma.ride.update({
    where: { id },
    data: updateData,
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
  });

  res.json({
    success: true,
    data: { ride: updatedRide },
  });
}));

// Cancel ride (user or admin)
router.patch('/:id/cancel', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { payment: true },
  });

  if (!ride) {
    return res.status(404).json({
      success: false,
      message: 'Ride not found',
    });
  }

  // Check permissions
  if (ride.userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  if (ride.status !== 'PENDING' && ride.status !== 'ASSIGNED') {
    return res.status(400).json({
      success: false,
      message: 'Ride cannot be cancelled at this stage',
    });
  }

  const updatedRide = await prisma.ride.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });

  // Cancel Stripe payment intent if it exists
  if (ride.payment?.stripePaymentIntentId) {
    try {
      await stripe.paymentIntents.cancel(ride.payment.stripePaymentIntentId);
    } catch (error) {
      console.error('Failed to cancel Stripe payment intent:', error);
    }
  }

  res.json({
    success: true,
    data: { ride: updatedRide },
    message: 'Ride cancelled successfully',
  });
}));

export default router;