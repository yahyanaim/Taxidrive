import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { authenticate, authorize, requireStatus } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { UpdateProfileSchema, UpdateDriverProfileSchema } from '../schemas/validation.js';
import { generateId } from '../utils/auth.js';

const router = Router();

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', authenticate, (req: Request, res: Response) => {
  const user = store.getUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const profile = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.role === 'driver') {
    const driverProfile = store.getDriverProfile(user.id);
    Object.assign(profile, driverProfile);
  } else if (user.role === 'rider') {
    const riderProfile = store.getRiderProfile(user.id);
    Object.assign(profile, riderProfile);
  }

  res.json(profile);
});

/**
 * PATCH /api/profile
 * Update current user's profile
 */
router.patch('/', authenticate, (req: Request, res: Response) => {
  try {
    const input = UpdateProfileSchema.parse(req.body);

    const user = store.updateUser(req.user!.id, {
      firstName: input.firstName || undefined,
      lastName: input.lastName || undefined,
      phoneNumber: input.phoneNumber || undefined,
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
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

/**
 * GET /api/profile/driver
 * Get driver profile details
 */
router.get('/driver', authenticate, authorize('driver'), (req: Request, res: Response) => {
  const driverProfile = store.getDriverProfile(req.user!.id);
  if (!driverProfile) {
    res.status(404).json({ error: 'Driver profile not found' });
    return;
  }

  res.json(driverProfile);
});

/**
 * PATCH /api/profile/driver
 * Update driver profile
 */
router.patch('/driver', authenticate, authorize('driver'), (req: Request, res: Response) => {
  try {
    const input = UpdateDriverProfileSchema.parse(req.body);

    const updates: any = {};
    if (input.licenseNumber !== undefined) updates.licenseNumber = input.licenseNumber;
    if (input.licenseExpiry !== undefined) updates.licenseExpiry = new Date(input.licenseExpiry);
    if (input.vehicleType !== undefined) updates.vehicleType = input.vehicleType;
    if (input.vehicleNumber !== undefined) updates.vehicleNumber = input.vehicleNumber;
    if (input.isAvailable !== undefined) updates.isAvailable = input.isAvailable;

    const driverProfile = store.updateDriverProfile(req.user!.id, updates);
    if (!driverProfile) {
      throw new AppError(404, 'Driver profile not found');
    }

    res.json(driverProfile);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      throw error;
    }
  }
});

/**
 * POST /api/profile/driver/documents
 * Add driver document
 */
router.post('/driver/documents', authenticate, authorize('driver'), (req: Request, res: Response) => {
  try {
    const { type, url } = req.body;

    if (!['license', 'insurance', 'registration', 'inspection'].includes(type)) {
      throw new AppError(400, 'Invalid document type');
    }

    const document = {
      id: generateId(),
      type,
      url,
      status: 'pending',
      uploadedAt: new Date(),
    };

    const result = store.addDriverDocument(req.user!.id, document);
    if (!result) {
      throw new AppError(404, 'Driver profile not found');
    }

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      throw error;
    }
  }
});

/**
 * GET /api/profile/driver/documents
 * Get driver documents
 */
router.get('/driver/documents', authenticate, authorize('driver'), (req: Request, res: Response) => {
  const documents = store.getDriverDocuments(req.user!.id);
  res.json(documents);
});

/**
 * PATCH /api/profile/driver/availability
 * Toggle driver availability
 */
router.patch('/driver/availability', authenticate, authorize('driver'), (req: Request, res: Response) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      throw new AppError(400, 'isAvailable must be a boolean');
    }

    const driverProfile = store.updateDriverProfile(req.user!.id, { isAvailable });
    if (!driverProfile) {
      throw new AppError(404, 'Driver profile not found');
    }

    res.json({
      isAvailable: driverProfile.isAvailable,
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
