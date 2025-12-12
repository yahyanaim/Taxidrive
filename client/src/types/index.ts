export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isActive: boolean;
  isAdmin: boolean;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleColor: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  backgroundCheck: boolean;
  isApproved: boolean;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  stripeAccountId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Ride {
  id: string;
  userId: string;
  driverId?: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  distance: number;
  duration: number;
  fare: number;
  surgeMultiplier: number;
  totalFare: number;
  status: RideStatus;
  paymentIntentId?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  driver?: Driver;
  payment?: Payment;
}

export interface Payment {
  id: string;
  rideId: string;
  userId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  ride?: Ride;
  user?: User;
  invoice?: Invoice;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  rideId?: string;
  type: TransactionType;
  stripeTransactionId?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description?: string;
  metadata?: any;
  createdAt: string;
  user?: User;
  ride?: Ride;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  payment?: Payment;
}

export interface Payout {
  id: string;
  driverId: string;
  amount: number;
  currency: string;
  stripePayoutId?: string;
  status: PayoutStatus;
  scheduledDate?: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  driver?: Driver;
}

export enum RideStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  PAYOUT = 'PAYOUT',
  FEE = 'FEE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface DashboardMetrics {
  totalUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalRides: number;
  completedRides: number;
  totalRevenue: number;
  todayRides: number;
  todayRevenue: number;
  pendingDrivers: number;
}

export interface GrowthMetrics {
  rides: number;
  revenue: number;
}