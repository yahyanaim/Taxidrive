import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { ApproveDriverSchema, RejectDriverSchema, UpdateUserStatusSchema } from '../schemas/validation.js';

const router = Router();

/**
 * GET /api/admin/drivers/pending
 * Get pending driver approvals
 */
router.get('/drivers/pending', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const pendingDrivers = store.getPendingDrivers();
  const result = pendingDrivers.map((profile) => {
    const user = store.getUserById(profile.userId);
    return {
      ...profile,
      user: user
        ? {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
          }
        : null,
    };
  });

  res.json(result);
});

/**
 * GET /api/admin/drivers
 * Get all drivers
 */
router.get('/drivers', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const allDrivers = store.getAllDriverProfiles();
  const result = allDrivers.map((profile) => {
    const user = store.getUserById(profile.userId);
    return {
      ...profile,
      user: user
        ? {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
          }
        : null,
    };
  });

  res.json(result);
});

/**
 * POST /api/admin/drivers/:driverId/approve
 * Approve a driver
 */
router.post('/drivers/:driverId/approve', authenticate, authorize('admin'), (req: Request, res: Response) => {
  try {
    const input = ApproveDriverSchema.parse(req.body);

    const driverProfile = store.getDriverProfile(req.params.driverId);
    if (!driverProfile) {
      throw new AppError(404, 'Driver profile not found');
    }

    const user = store.getUserById(req.params.driverId);
    if (!user) {
      throw new AppError(404, 'Driver user not found');
    }

    const updated = store.updateDriverProfile(req.params.driverId, {
      status: 'approved',
      approvalNotes: input.approvalNotes,
      approvedAt: new Date(),
      approvedBy: req.user!.id,
    });

    res.json({
      ...updated,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      throw error;
    }
  }
});

/**
 * POST /api/admin/drivers/:driverId/reject
 * Reject a driver
 */
router.post('/drivers/:driverId/reject', authenticate, authorize('admin'), (req: Request, res: Response) => {
  try {
    const input = RejectDriverSchema.parse(req.body);

    const driverProfile = store.getDriverProfile(req.params.driverId);
    if (!driverProfile) {
      throw new AppError(404, 'Driver profile not found');
    }

    const user = store.getUserById(req.params.driverId);
    if (!user) {
      throw new AppError(404, 'Driver user not found');
    }

    const updated = store.updateDriverProfile(req.params.driverId, {
      status: 'rejected',
      rejectionReason: input.rejectionReason,
      rejectedAt: new Date(),
      rejectedBy: req.user!.id,
    });

    store.updateUser(req.params.driverId, {
      status: 'rejected',
    });

    res.json({
      ...updated,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      throw error;
    }
  }
});

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const users = store.getAllUsers();
  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phoneNumber: u.phoneNumber,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))
  );
});

/**
 * PATCH /api/admin/users/:userId/status
 * Update user status
 */
router.patch('/users/:userId/status', authenticate, authorize('admin'), (req: Request, res: Response) => {
  try {
    const input = UpdateUserStatusSchema.parse(req.body);

    const user = store.updateUser(req.params.userId, {
      status: input.status,
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      throw error;
    }
  }
});

export default router;
