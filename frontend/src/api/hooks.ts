import { useMutation, useQuery } from '@tanstack/react-query';
import client from './client';
import { AxiosError } from 'axios';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
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

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface UpdateDriverProfileRequest {
  licenseNumber?: string;
  licenseExpiry?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  isAvailable?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  emailVerified: boolean;
}

export interface DriverProfile {
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleType: string;
  vehicleNumber: string;
  status: string;
  isAvailable: boolean;
  documents: any[];
}

// Auth hooks
export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupRequest) => client.post<LoginResponse>('/auth/signup', data),
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => client.post<LoginResponse>('/auth/login', data),
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => Promise.resolve(),
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => client.get<UserProfile>('/auth/me').then((res) => res.data),
  });
}

// Profile hooks
export function useGetProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => client.get<UserProfile>('/profile').then((res) => res.data),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      client.patch<UserProfile>('/profile', data),
    onSuccess: () => {
      // Invalidate queries
    },
  });
}

export function useGetDriverProfile() {
  return useQuery({
    queryKey: ['profile', 'driver'],
    queryFn: () => client.get<DriverProfile>('/profile/driver').then((res) => res.data),
  });
}

export function useUpdateDriverProfile() {
  return useMutation({
    mutationFn: (data: UpdateDriverProfileRequest) =>
      client.patch<DriverProfile>('/profile/driver', data),
  });
}

export function useToggleDriverAvailability() {
  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      client.patch('/profile/driver/availability', { isAvailable }),
  });
}

export function useAddDriverDocument() {
  return useMutation({
    mutationFn: (data: { type: string; url?: string }) =>
      client.post('/profile/driver/documents', data),
  });
}

export function useGetDriverDocuments() {
  return useQuery({
    queryKey: ['profile', 'driver', 'documents'],
    queryFn: () => client.get('/profile/driver/documents').then((res) => res.data),
  });
}
