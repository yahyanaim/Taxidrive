import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, generateId, verifyRefreshToken } from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { SignupSchema, LoginSchema, RefreshTokenSchema } from '../schemas/validation.js';
import { User, DriverProfile } from '../types.js';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user (rider or driver)
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const input = SignupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = store.getUserByEmail(input.email);
    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user
    const userId = generateId();
    const user: User = {
      id: userId,
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      role: input.role,
      status: 'active',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdUser = store.createUser(user);

    // Create role-specific profile
    if (input.role === 'driver') {
      const driverProfile: DriverProfile = {
        userId,
        licenseNumber: '',
        licenseExpiry: new Date(),
        vehicleType: '',
        vehicleNumber: '',
        status: 'pending_approval',
        isAvailable: false,
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.createDriverProfile(driverProfile);
    } else {
      store.createRiderProfile({
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Generate tokens
    const payload = {
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      status: createdUser.status,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: createdUser.role,
        status: createdUser.status,
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
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const input = LoginSchema.parse(req.body);

    // Find user by email
    const user = store.getUserByEmail(input.email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const passwordValid = await verifyPassword(input.password, user.password);
    if (!passwordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check if account is active
    if (user.status === 'rejected' || user.status === 'inactive') {
      throw new AppError(403, 'Account is not active');
    }

    // Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
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
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const input = RefreshTokenSchema.parse(req.body);

    const payload = verifyRefreshToken(input.refreshToken);
    if (!payload) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Verify user still exists and has same status
    const user = store.getUserById(payload.id);
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    const newPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    const accessToken = generateAccessToken(newPayload);
    const refreshToken = generateRefreshToken(newPayload);

    res.json({
      accessToken,
      refreshToken,
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
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, (req: Request, res: Response) => {
  const user = store.getUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
  });
});

export default router;
