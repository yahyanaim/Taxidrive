import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../server.js';

const BASE_URL = 'http://localhost:3000/api';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Reset store before each test
    // In a real app, this would reset the database
  });

  describe('POST /auth/signup', () => {
    it('should register a rider successfully', async () => {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'rider@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Rider',
          phoneNumber: '1234567890',
          role: 'rider',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.user.email).toBe('rider@example.com');
      expect(data.user.role).toBe('rider');
    });

    it('should register a driver successfully', async () => {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'driver@example.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Driver',
          phoneNumber: '0987654321',
          role: 'driver',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.user.email).toBe('driver@example.com');
      expect(data.user.role).toBe('driver');
    });

    it('should reject duplicate email', async () => {
      // First signup
      await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '1234567890',
          role: 'rider',
        }),
      });

      // Duplicate email
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password456',
          firstName: 'Another',
          lastName: 'User',
          phoneNumber: '0987654321',
          role: 'rider',
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe('Email already registered');
    });

    it('should validate password length', async () => {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'short@example.com',
          password: 'short',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '1234567890',
          role: 'rider',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation error');
      expect(data.details).toBeDefined();
    });

    it('should validate email format', async () => {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '1234567890',
          role: 'rider',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Validation error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '1234567890',
          role: 'rider',
        }),
      });
    });

    it('should login with valid credentials', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.user.email).toBe('user@example.com');
    });

    it('should reject invalid password', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid email or password');
    });

    it('should reject non-existent user', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid email or password');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'refresh@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '1234567890',
          role: 'rider',
        }),
      });

      const data = await signupResponse.json();
      refreshToken = data.refreshToken;
    });

    it('should refresh access token', async () => {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.accessToken).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: 'invalid-token',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid or expired refresh token');
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'me@example.com',
          password: 'password123',
          firstName: 'Me',
          lastName: 'User',
          phoneNumber: '1234567890',
          role: 'rider',
        }),
      });

      const data = await signupResponse.json();
      accessToken = data.accessToken;
    });

    it('should get current user', async () => {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.email).toBe('me@example.com');
      expect(data.role).toBe('rider');
    });

    it('should reject missing token', async () => {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {},
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: { Authorization: 'Bearer invalid-token' },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
