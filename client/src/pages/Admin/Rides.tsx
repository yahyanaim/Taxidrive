import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { formatDate, formatNumber, formatDistance, formatDuration, getStatusBadgeClass } from '@/utils/formatters';

const AdminRides: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    dateFrom: '',
    dateTo: '',
  });

  const { data: ridesData, isLoading, error } = useQuery(
    ['adminRides', page, searchTerm, filters],
    () => apiService.getAdminRides({
      page,
      limit: 20,
      search: searchTerm || undefined,
      status: filters.status || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }),
    {
      keepPreviousData: true,
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
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

  // Calculate summary statistics
  const totalRides = rides.length;
  const completedRides = rides.filter(r => r.status === 'COMPLETED').length;
  const cancelledRides = rides.filter(r => r.status === 'CANCELLED').length;
  const totalRevenue = rides
    .filter(r => r.status === 'COMPLETED')
    .reduce((sum, ride) => sum + ride.totalFare, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Rides</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor all ride activities, track ride status, and manage ride operations.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
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
                    {formatNumber(totalRides)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatNumber(completedRides)}
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
                <div className="p-3 rounded-md bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cancelled
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatNumber(cancelledRides)}
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
                    Revenue
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ${totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            {/* Search */}
            <div className="sm:col-span-2">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search rides..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="ml-3 btn btn-primary"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="input"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <input
                type="date"
                className="input"
                placeholder="From date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <input
                type="date"
                className="input"
                placeholder="To date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rides Table */}
      <div className="card">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No rides found matching your criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Route</th>
                      <th className="table-header-cell">Passenger</th>
                      <th className="table-header-cell">Driver</th>
                      <th className="table-header-cell">Distance</th>
                      <th className="table-header-cell">Duration</th>
                      <th className="table-header-cell">Fare</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {rides.map((ride) => (
                      <tr key={ride.id}>
                        <td className="table-cell">
                          <div className="space-y-1">
                            <div className="flex items-start">
                              <MapPinIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="ml-2 text-sm text-gray-900">
                                {ride.pickupAddress}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <MapPinIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="ml-2 text-sm text-gray-900">
                                {ride.dropoffAddress}
                              </span>
                            </div>
                          </div>
                        </td>
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
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          {ride.driver ? (
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-green-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-700">
                                    {ride.driver.user?.name?.charAt(0) || 'D'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {ride.driver.user?.name || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {ride.driver.vehicleColor} {ride.driver.vehicleMake}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No driver assigned</span>
                          )}
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
                            ${ride.totalFare.toFixed(2)}
                          </div>
                          {ride.surgeMultiplier > 1 && (
                            <div className="text-xs text-gray-500">
                              {ride.surgeMultiplier}x surge
                            </div>
                          )}
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
                        <span className="font-medium">{formatNumber(pagination.total)}</span>
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

export default AdminRides;