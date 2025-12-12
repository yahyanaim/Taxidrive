import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Components
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminUsers from '@/pages/Admin/Users';
import AdminDrivers from '@/pages/Admin/Drivers';
import AdminRides from '@/pages/Admin/Rides';
import AdminPayments from '@/pages/Admin/Payments';
import AdminTransactions from '@/pages/Admin/Transactions';
import PaymentSettings from '@/pages/User/PaymentSettings';
import RideHistory from '@/pages/User/RideHistory';
import Profile from '@/pages/User/Profile';
import DriverDashboard from '@/pages/Driver/Dashboard';
import DriverRides from '@/pages/Driver/Rides';

// Styles
import '@/styles/globals.css';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

// Main App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect based on user role */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/drivers"
          element={
            <ProtectedRoute adminOnly>
              <AdminDrivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/rides"
          element={
            <ProtectedRoute adminOnly>
              <AdminRides />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/payments"
          element={
            <ProtectedRoute adminOnly>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/transactions"
          element={
            <ProtectedRoute adminOnly>
              <AdminTransactions />
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route path="dashboard" element={<PaymentSettings />} />
        <Route path="ride-history" element={<RideHistory />} />
        <Route path="profile" element={<Profile />} />

        {/* Driver Routes */}
        <Route path="driver" element={<DriverDashboard />} />
        <Route path="driver/rides" element={<DriverRides />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <Router>
          <AuthProvider>
            <div className="App">
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </AuthProvider>
        </Router>
      </Elements>
    </QueryClientProvider>
  );
};

export default App;