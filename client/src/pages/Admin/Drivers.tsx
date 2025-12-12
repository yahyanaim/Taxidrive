import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  MagnifyingGlassIcon, 
  CheckIcon, 
  XMarkIcon,
  TruckIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { Driver } from '@/types';
import { formatDate, formatNumber, formatPhoneNumber, getStatusBadgeClass } from '@/utils/formatters';
import toast from 'react-hot-toast';

const AdminDrivers: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isApproved: undefined as boolean | undefined,
    backgroundCheck: undefined as boolean | undefined,
  });

  const { data: driversData, isLoading, error } = useQuery(
    ['adminDrivers', page, searchTerm, filters],
    () => apiService.getAdminDrivers({
      page,
      limit: 20,
      search: searchTerm || undefined,
      ...filters,
    }),
    {
      keepPreviousData: true,
    }
  );

  const { data: pendingDriversData } = useQuery(
    'pendingDrivers',
    () => apiService.getDrivers({ isApproved: false, backgroundCheck: true, limit: 50 }),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const approveDriverMutation = useMutation(
    ({ driverId, isApproved }: { driverId: string; isApproved: boolean }) =>
      apiService.adminApproveDriver(driverId, isApproved),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminDrivers');
        queryClient.invalidateQueries('pendingDrivers');
        toast.success('Driver status updated successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update driver status');
      },
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (key: string, value: boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleApproveDriver = (driver: Driver) => {
    if (window.confirm(`Are you sure you want to approve ${driver.user?.name} as a driver?`)) {
      approveDriverMutation.mutate({
        driverId: driver.id,
        isApproved: true,
      });
    }
  };

  const handleRejectDriver = (driver: Driver) => {
    if (window.confirm(`Are you sure you want to reject ${driver.user?.name}'s driver application?`)) {
      approveDriverMutation.mutate({
        driverId: driver.id,
        isApproved: false,
      });
    }
  };

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Failed to load drivers. Please try again.
        </div>
      </div>
    );
  }

  const drivers = driversData?.data?.drivers || [];
  const pagination = driversData?.data?.pagination;
  const pendingDrivers = pendingDriversData?.data?.drivers || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Drivers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage driver applications, approvals, and driver information.
        </p>
      </div>

      {/* Pending Approval Queue */}
      {pendingDrivers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <TruckIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Pending Driver Approvals ({pendingDrivers.length})
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Drivers awaiting approval. Please review and approve or reject applications.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingDrivers.slice(0, 6).map((driver) => (
              <div key={driver.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        {driver.user?.name?.charAt(0) || 'D'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {driver.user?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveDriver(driver)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                    >
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectDriver(driver)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      <XMarkIcon className="h-3 w-3 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {pendingDrivers.length > 6 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setFilters({ isApproved: false, backgroundCheck: true })}
                className="text-sm text-yellow-800 hover:text-yellow-900 font-medium"
              >
                View all {pendingDrivers.length} pending drivers
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search drivers..."
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

            {/* Approval Status Filter */}
            <div>
              <select
                className="input"
                value={filters.isApproved === undefined ? '' : filters.isApproved.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('isApproved', value === '' ? undefined : value === 'true');
                }}
              >
                <option value="">All Approval Status</option>
                <option value="true">Approved</option>
                <option value="false">Pending/Rejected</option>
              </select>
            </div>

            {/* Background Check Filter */}
            <div>
              <select
                className="input"
                value={filters.backgroundCheck === undefined ? '' : filters.backgroundCheck.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('backgroundCheck', value === '' ? undefined : value === 'true');
                }}
              >
                <option value="">Background Check</option>
                <option value="true">Completed</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="card">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No drivers found matching your criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Driver</th>
                      <th className="table-header-cell">Vehicle</th>
                      <th className="table-header-cell">Contact</th>
                      <th className="table-header-cell">Approval</th>
                      <th className="table-header-cell">Background</th>
                      <th className="table-header-cell">Rating</th>
                      <th className="table-header-cell">Total Rides</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {drivers.map((driver) => (
                      <tr key={driver.id}>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {driver.user?.name?.charAt(0) || 'D'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {driver.user?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                License: {driver.licenseNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {driver.vehicleYear} {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
                          </div>
                          <div className="text-sm text-gray-500">
                            Plate: {driver.vehiclePlate}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              {driver.user?.email}
                            </div>
                            {driver.user?.phone && (
                              <div className="flex items-center mt-1">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {formatPhoneNumber(driver.user.phone)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={getStatusBadgeClass(driver.isApproved ? 'ACTIVE' : 'INACTIVE')}>
                            {driver.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={getStatusBadgeClass(driver.backgroundCheck ? 'ACTIVE' : 'INACTIVE')}>
                            {driver.backgroundCheck ? 'Clear' : 'Pending'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(driver.rating) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">
                              {driver.rating.toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {formatNumber(driver.totalRides)}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            {!driver.isApproved && (
                              <>
                                <button
                                  onClick={() => handleApproveDriver(driver)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                                >
                                  <CheckIcon className="h-3 w-3 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectDriver(driver)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                                >
                                  <XMarkIcon className="h-3 w-3 mr-1" />
                                  Reject
                                </button>
                              </>
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

export default AdminDrivers;