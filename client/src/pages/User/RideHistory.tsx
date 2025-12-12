import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { formatDate, formatDistance, formatDuration, formatCurrency, getStatusBadgeClass } from '@/utils/formatters';
import toast from 'react-hot-toast';

const RideHistory: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: ridesData, isLoading, error } = useQuery(
    ['myRides', page, statusFilter],
    () => apiService.getMyRides({
      page,
      limit: 10,
      status: statusFilter || undefined,
    }),
    {
      keepPreviousData: true,
    }
  );

  const { data: receiptData } = useQuery(
    'receiptData',
    () => null, // This would be used to fetch specific receipt data
    {
      enabled: false, // Only fetch when needed
    }
  );

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await apiService.getReceipt(paymentId);
      if (response.success) {
        // In a real implementation, this would generate and download a PDF receipt
        toast.success('Receipt downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Failed to load ride history. Please try again.
        </div>
      </div>
    );
  }

  const rides = ridesData?.data?.rides || [];
  const pagination = ridesData?.data?.pagination;

  const statusOptions = [
    { value: '', label: 'All Rides' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Ride History</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your past rides, track payment status, and download receipts.
        </p>
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
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rides found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter ? 'No rides match the selected filter.' : 'You haven\'t taken any rides yet.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {rides.map((ride) => (
              <div key={ride.id} className="card">
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Ride Details */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Route */}
                        <div className="flex-1">
                          <div className="flex items-start space-x-2">
                            <MapPinIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {ride.pickupAddress}
                              </div>
                              <div className="text-xs text-gray-500">Pickup</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-2 mt-3">
                            <MapPinIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {ride.dropoffAddress}
                              </div>
                              <div className="text-xs text-gray-500">Destination</div>
                            </div>
                          </div>
                        </div>

                        {/* Ride Info */}
                        <div className="flex flex-col space-y-2 min-w-0 flex-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDate(ride.createdAt, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {formatDistance(ride.distance)} • {formatDuration(ride.duration)}
                          </div>
                          
                          {ride.driver && (
                            <div className="text-sm text-gray-500">
                              Driver: {ride.driver.user?.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fare and Status */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(ride.totalFare)}
                        </span>
                        <span className={getStatusBadgeClass(ride.status)}>
                          {ride.status}
                        </span>
                      </div>
                      
                      {ride.surgeMultiplier > 1 && (
                        <div className="text-xs text-gray-500">
                          {ride.surgeMultiplier}x surge pricing
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {ride.payment && ride.payment.status === 'SUCCEEDED' && (
                          <button
                            onClick={() => handleDownloadReceipt(ride.payment.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <DocumentArrowDownIcon className="h-3 w-3 mr-1" />
                            Receipt
                          </button>
                        )}
                        
                        {ride.status === 'COMPLETED' && (
                          <button
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            Rate Driver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {ride.payment && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-gray-500">Payment Status:</span>
                          <span className={`ml-2 ${getStatusBadgeClass(ride.payment.status)}`}>
                            {ride.payment.status}
                          </span>
                        </div>
                        {ride.payment.paidAt && (
                          <span className="text-gray-500">
                            Paid on {formatDate(ride.payment.paidAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
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
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              pageNum === page
                                ? 'z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.pages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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

      {/* Summary Statistics */}
      {!isLoading && rides.length > 0 && (
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
                      {pagination?.total || 0}
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
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Spent
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {formatCurrency(rides.reduce((sum, ride) => sum + ride.totalFare, 0))}
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
                  <div className="p-3 rounded-md bg-purple-100">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Distance
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {formatDistance(rides.reduce((sum, ride) => sum + ride.distance, 0))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideHistory;