import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['rider', 'driver']),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
});

export const UpdateDriverProfileSchema = z.object({
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().datetime().optional(),
  vehicleType: z.string().optional(),
  vehicleNumber: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

export const ApproveDriverSchema = z.object({
  approvalNotes: z.string().optional(),
});

export const RejectDriverSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
});

export const UpdateUserStatusSchema = z.object({
  status: z.enum(['pending', 'active', 'inactive']),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateDriverProfileInput = z.infer<typeof UpdateDriverProfileSchema>;
export type ApproveDriverInput = z.infer<typeof ApproveDriverSchema>;
export type RejectDriverInput = z.infer<typeof RejectDriverSchema>;
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;
