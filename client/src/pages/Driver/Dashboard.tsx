import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { formatDate, formatCurrency, formatDistance, formatDuration, getStatusBadgeClass } from '@/utils/formatters';

const DriverDashboard: React.FC = () => {
  const [period, setPeriod] = useState('7d');

  const { data: driverProfileData, isLoading: profileLoading } = useQuery(
    'driverProfile',
    () => apiService.getDriverProfile()
  );

  const { data: ridesData, isLoading: ridesLoading } = useQuery(
    ['driverRides', period],
    () => apiService.getDriverRides({ 
      page: 1, 
      limit: 10,
      status: period === 'today' ? undefined : undefined 
    })
  );

  const { data: revenueData, isLoading: revenueLoading } = useQuery(
    ['driverRevenue', period],
    () => apiService.getRevenueAnalytics(period === '30d' ? '30d' : '7d')
  );

  if (profileLoading || ridesLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const driver = driverProfileData?.data?.driver;
  const rides = ridesData?.data?.rides || [];
  const pagination = ridesData?.data?.pagination;

  if (!driver) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Driver Profile Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have a driver profile. Register as a driver to start earning.
          </p>
        </div>
      </div>
    );
  }

  const isPendingApproval = !driver.isApproved;
  const isBackgroundCheckPending = !driver.backgroundCheck;

  const driverStats = [
    {
      title: 'Total Rides',
      value: driver.totalRides.toString(),
      icon: TruckIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Rating',
      value: `${driver.rating.toFixed(1)} ⭐`,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Total Earnings',
      value: formatCurrency(driver.totalEarnings),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ];

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'today', label: 'Today' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Driver Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {driver.user?.name}! Here's your performance overview.
        </p>
      </div>

      {/* Driver Status Alerts */}
      {isPendingApproval && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Driver Application Pending
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your driver application is currently under review. 
                  You'll be able to start accepting rides once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isBackgroundCheckPending && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Background Check Required
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  A background check is required before you can start driving. 
                  This process usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {driverStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} p-3 rounded-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicle Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {driver.vehicleYear} {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">License Plate</dt>
              <dd className="mt-1 text-sm text-gray-900">{driver.vehiclePlate}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">License Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{driver.licenseNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">License Expires</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(driver.licenseExpiry, { year: 'numeric', month: 'short', day: 'numeric' })}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rides */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Rides</h3>
            <select
              className="text-sm border-gray-300 rounded-md"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          {rides.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rides yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete your driver setup to start receiving ride requests.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {rides.map((ride) => (
                <div key={ride.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {ride.user?.name || 'Unknown Passenger'}
                        </div>
                        <span className={getStatusBadgeClass(ride.status)}>
                          {ride.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {ride.pickupAddress}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          {ride.dropoffAddress}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatDistance(ride.distance)}</span>
                        <span>{formatDuration(ride.duration)}</span>
                        <span>{formatDate(ride.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(ride.totalFare)}
                      </div>
                      {ride.startedAt && ride.completedAt && (
                        <div className="text-xs text-gray-500">
                          Duration: {formatDuration(ride.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {pagination && pagination.total > 10 && (
                <div className="text-center">
                  <a
                    href="/driver/rides"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    View all rides →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Driver Performance Chart */}
      {revenueData?.data?.chartData && revenueData.data.chartData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Earnings Trend ({period === '7d' ? 'Last 7 Days' : 'Last 30 Days'})
            </h3>
          </div>
          <div className="card-body">
            <div className="text-center py-8 text-gray-500">
              {/* In a real implementation, you would render a chart here using recharts */}
              <p>Earnings chart would be displayed here</p>
              <p className="text-sm mt-2">
                Total Earnings: {formatCurrency(revenueData.data.summary?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/driver/rides"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <TruckIcon className="h-10 w-10 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  View All Rides
                </p>
                <p className="text-sm text-gray-500 truncate">
                  See your complete ride history
                </p>
              </div>
            </a>

            <a
              href="/profile"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  Update Profile
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Manage your personal information
                </p>
              </div>
            </a>

            <a
              href="/dashboard"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <svg className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  Payment Settings
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Manage payment methods
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;