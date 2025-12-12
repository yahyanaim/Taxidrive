import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { Ride } from '@/types';
import { formatDate, formatDistance, formatDuration, formatCurrency, getStatusBadgeClass } from '@/utils/formatters';
import toast from 'react-hot-toast';

const DriverRides: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: ridesData, isLoading, error } = useQuery(
    ['driverRides', page, statusFilter],
    () => apiService.getDriverRides({
      page,
      limit: 20,
      status: statusFilter || undefined,
    }),
    {
      keepPreviousData: true,
    }
  );

  const updateRideStatusMutation = useMutation(
    ({ rideId, status, reason }: { rideId: string; status: string; reason?: string }) =>
      apiService.updateRideStatus(rideId, status, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('driverRides');
        toast.success('Ride status updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update ride status');
      },
    }
  );

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleUpdateRideStatus = (ride: Ride, newStatus: string, reason?: string) => {
    if (window.confirm(`Are you sure you want to mark this ride as ${newStatus.toLowerCase()}?`)) {
      updateRideStatusMutation.mutate({
        rideId: ride.id,
        status: newStatus,
        reason,
      });
    }
  };

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Failed to load rides. Please try again.
        </div>
      </div>
    );
  }

  const rides = ridesData?.data?.rides || [];
  const pagination = ridesData?.data?.pagination;

  const statusOptions = [
    { value: '', label: 'All Rides' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  // Calculate summary statistics
  const totalRides = rides.length;
  const completedRides = rides.filter(r => r.status === 'COMPLETED').length;
  const totalEarnings = rides
    .filter(r => r.status === 'COMPLETED')
    .reduce((sum, ride) => sum + ride.totalFare, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Rides</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your rides and update their status as needed.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Rides
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {totalRides}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-100">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {completedRides}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Earnings
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatCurrency(totalEarnings)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="card">
        <div className="card-body">
          <div className="flex space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex space-x-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusFilterChange(option.value)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    statusFilter === option.value
                      ? 'bg-primary-100 text-primary-800 border-primary-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  } border`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div className="card">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rides found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter ? 'No rides match the selected filter.' : 'You don\'t have any rides yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Passenger</th>
                      <th className="table-header-cell">Route</th>
                      <th className="table-header-cell">Distance</th>
                      <th className="table-header-cell">Duration</th>
                      <th className="table-header-cell">Fare</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {rides.map((ride) => (
                      <tr key={ride.id}>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {ride.user?.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ride.user?.email}
                              </div>
                              {ride.user?.phone && (
                                <div className="text-xs text-gray-400">
                                  {ride.user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="space-y-1">
                            <div className="flex items-start">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-900">
                                {ride.pickupAddress}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-900">
                                {ride.dropoffAddress}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {formatDistance(ride.distance)}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center text-sm text-gray-900">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDuration(ride.duration)}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(ride.totalFare)}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={getStatusBadgeClass(ride.status)}>
                            {ride.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {formatDate(ride.createdAt, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            {ride.status === 'ASSIGNED' && (
                              <button
                                onClick={() => handleUpdateRideStatus(ride, 'IN_PROGRESS')}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                              >
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Start
                              </button>
                            )}
                            
                            {ride.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleUpdateRideStatus(ride, 'COMPLETED')}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                              >
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Complete
                              </button>
                            )}
                            
                            {(ride.status === 'ASSIGNED' || ride.status === 'IN_PROGRESS') && (
                              <button
                                onClick={() => handleUpdateRideStatus(ride, 'CANCELLED', 'Driver cancelled')}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                              >
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{((page - 1) * pagination.limit) + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(page * pagination.limit, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{pagination.total}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === page
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverRides;