import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Driver,
  Ride,
  Payment,
  PaymentMethod,
  Transaction,
  ApiResponse,
  PaginatedResponse,
  DashboardMetrics,
  GrowthMetrics,
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.get('/auth/me');
    return response.data;
  }

  // User methods
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isAdmin?: boolean;
  }): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id: string): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response: AxiosResponse = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Driver methods
  async registerDriver(data: {
    licenseNumber: string;
    licenseExpiry: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehiclePlate: string;
    vehicleColor: string;
    insuranceNumber: string;
    insuranceExpiry: string;
  }): Promise<ApiResponse<{ driver: Driver }>> {
    const response: AxiosResponse = await this.api.post('/drivers/register', data);
    return response.data;
  }

  async getDriverProfile(): Promise<ApiResponse<{ driver: Driver }>> {
    const response: AxiosResponse = await this.api.get('/drivers/me');
    return response.data;
  }

  async getDrivers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isApproved?: boolean;
    backgroundCheck?: boolean;
  }): Promise<PaginatedResponse<Driver>> {
    const response: AxiosResponse = await this.api.get('/drivers', { params });
    return response.data;
  }

  async getDriver(id: string): Promise<ApiResponse<{ driver: Driver }>> {
    const response: AxiosResponse = await this.api.get(`/drivers/${id}`);
    return response.data;
  }

  async approveDriver(id: string, isApproved: boolean): Promise<ApiResponse<{ driver: Driver }>> {
    const response: AxiosResponse = await this.api.patch(`/drivers/${id}/approve`, { isApproved });
    return response.data;
  }

  async updateDriverBackgroundCheck(id: string, backgroundCheck: boolean): Promise<ApiResponse<{ driver: Driver }>> {
    const response: AxiosResponse = await this.api.patch(`/drivers/${id}/background-check`, { backgroundCheck });
    return response.data;
  }

  // Ride methods
  async createRide(data: {
    pickupAddress: string;
    dropoffAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    distance: number;
    duration: number;
    fare: number;
    surgeMultiplier?: number;
  }): Promise<ApiResponse<{ ride: Ride & { clientSecret: string } }>> {
    const response: AxiosResponse = await this.api.post('/rides', data);
    return response.data;
  }

  async getMyRides(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ride>> {
    const response: AxiosResponse = await this.api.get('/rides/my-rides', { params });
    return response.data;
  }

  async getDriverRides(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ride>> {
    const response: AxiosResponse = await this.api.get('/rides/driver-rides', { params });
    return response.data;
  }

  async getAllRides(params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PaginatedResponse<Ride>> {
    const response: AxiosResponse = await this.api.get('/rides', { params });
    return response.data;
  }

  async getRide(id: string): Promise<ApiResponse<{ ride: Ride }>> {
    const response: AxiosResponse = await this.api.get(`/rides/${id}`);
    return response.data;
  }

  async updateRideStatus(id: string, status: string, reason?: string): Promise<ApiResponse<{ ride: Ride }>> {
    const response: AxiosResponse = await this.api.patch(`/rides/${id}/status`, { status, reason });
    return response.data;
  }

  async cancelRide(id: string, reason?: string): Promise<ApiResponse<{ ride: Ride }>> {
    const response: AxiosResponse = await this.api.patch(`/rides/${id}/cancel`, { reason });
    return response.data;
  }

  // Payment methods
  async addPaymentMethod(paymentMethodId: string): Promise<ApiResponse<{ paymentMethod: PaymentMethod }>> {
    const response: AxiosResponse = await this.api.post('/payments/payment-methods', { paymentMethodId });
    return response.data;
  }

  async getPaymentMethods(): Promise<ApiResponse<{ paymentMethods: PaymentMethod[] }>> {
    const response: AxiosResponse = await this.api.get('/payments/payment-methods');
    return response.data;
  }

  async deletePaymentMethod(id: string): Promise<ApiResponse> {
    const response: AxiosResponse = await this.api.delete(`/payments/payment-methods/${id}`);
    return response.data;
  }

  async setDefaultPaymentMethod(id: string): Promise<ApiResponse<{ paymentMethod: PaymentMethod }>> {
    const response: AxiosResponse = await this.api.patch(`/payments/payment-methods/${id}/default`);
    return response.data;
  }

  // Payment processing
  async confirmPayment(rideId: string, paymentMethodId: string): Promise<ApiResponse> {
    const response: AxiosResponse = await this.api.post('/payments/confirm-payment', {
      rideId,
      paymentMethodId,
    });
    return response.data;
  }

  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response: AxiosResponse = await this.api.get('/payments/history', { params });
    return response.data;
  }

  async refundPayment(rideId: string, amount?: number, reason?: string): Promise<ApiResponse> {
    const response: AxiosResponse = await this.api.post('/payments/refund', {
      rideId,
      amount,
      reason,
    });
    return response.data;
  }

  async getReceipt(paymentId: string): Promise<ApiResponse<{ payment: Payment; invoice: any }>> {
    const response: AxiosResponse = await this.api.get(`/payments/${paymentId}/receipt`);
    return response.data;
  }

  async getAllPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const response: AxiosResponse = await this.api.get('/payments', { params });
    return response.data;
  }

  // Admin methods
  async getDashboardMetrics(period: string = '7d'): Promise<ApiResponse<{
    metrics: DashboardMetrics;
    growth: GrowthMetrics;
    recentTransactions: Transaction[];
  }>> {
    const response: AxiosResponse = await this.api.get('/admin/dashboard', {
      params: { period },
    });
    return response.data;
  }

  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isAdmin?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse = await this.api.get('/admin/users', { params });
    return response.data;
  }

  async getAdminDrivers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isApproved?: boolean;
    backgroundCheck?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Driver>> {
    const response: AxiosResponse = await this.api.get('/admin/drivers', { params });
    return response.data;
  }

  async getAdminRides(params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PaginatedResponse<Ride>> {
    const response: AxiosResponse = await this.api.get('/admin/rides', { params });
    return response.data;
  }

  async getAdminPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const response: AxiosResponse = await this.api.get('/admin/payments', { params });
    return response.data;
  }

  async getAdminTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response: AxiosResponse = await this.api.get('/admin/transactions', { params });
    return response.data;
  }

  async getRevenueAnalytics(period: string = '30d'): Promise<ApiResponse<{
    chartData: Array<{ date: string; revenue: number; transactionCount: number }>;
    summary: {
      totalRevenue: number;
      totalTransactions: number;
      averageTransaction: number;
    };
  }>> {
    const response: AxiosResponse = await this.api.get('/admin/revenue', {
      params: { period },
    });
    return response.data;
  }

  async adminApproveDriver(id: string, isApproved: boolean): Promise<ApiResponse<{ driver: Driver }>> {
    const response: AxiosResponse = await this.api.patch(`/admin/drivers/${id}/approve`, { isApproved });
    return response.data;
  }

  async adminUpdateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.patch(`/admin/users/${id}/status`, { isActive });
    return response.data;
  }

  async adminRefundPayment(paymentId: string, amount?: number, reason?: string): Promise<ApiResponse> {
    const response: AxiosResponse = await this.api.post(`/admin/payments/${paymentId}/refund`, {
      amount,
      reason,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;