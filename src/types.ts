export type UserRole = 'rider' | 'driver' | 'admin';

export type UserStatus = 'pending' | 'active' | 'inactive' | 'rejected';

export type DriverStatus = 'pending_approval' | 'approved' | 'rejected' | 'inactive';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
}

export interface DriverProfile {
  userId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  vehicleType: string;
  vehicleNumber: string;
  status: DriverStatus;
  isAvailable: boolean;
  documents: DriverDocument[];
  approvalNotes?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverDocument {
  id: string;
  type: 'license' | 'insurance' | 'registration' | 'inspection';
  url?: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verificationNotes?: string;
}

export interface RiderProfile {
  userId: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'rider' | 'driver';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
