import { Router } from 'express';
import { z } from 'zod';
import prisma from '../database/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', adminMiddleware, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    isActive, 
    isAdmin 
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

// Get user by ID
router.get('/:id', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;

  // Users can only access their own data unless they're admin
  if (req.user.id !== id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      rides: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          pickupAddress: true,
          dropoffAddress: true,
          totalFare: true,
          status: true,
          createdAt: true,
        },
      },
      paymentMethods: true,
      transactions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    data: { user },
  });
}));

// Update user
router.put('/:id', authMiddleware, asyncHandler(async (req: any, res) => {
  const { id } = req.params;
  const updateSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
  });

  // Users can only update their own data unless they're admin
  if (req.user.id !== id && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  const data = updateSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      isAdmin: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: { user },
  });
}));

// Deactivate/activate user (admin only)
router.patch('/:id/status', adminMiddleware, asyncHandler(async (req, res) => {
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

// Delete user (admin only)
router.delete('/:id', adminMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
}));

export default router;