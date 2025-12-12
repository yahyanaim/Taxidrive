import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const SignupRiderSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.literal('rider'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const SignupDriverSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.literal('driver'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
});

export const UpdateDriverProfileSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required').optional(),
  licenseExpiry: z.string().datetime().optional(),
  vehicleType: z.string().min(1, 'Vehicle type is required').optional(),
  vehicleNumber: z.string().min(1, 'Vehicle number is required').optional(),
  isAvailable: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupRiderInput = z.infer<typeof SignupRiderSchema>;
export type SignupDriverInput = z.infer<typeof SignupDriverSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateDriverProfileInput = z.infer<typeof UpdateDriverProfileSchema>;
