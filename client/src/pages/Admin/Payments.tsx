import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { Payment } from '@/types';
import { formatDate, formatNumber, formatCurrency, getStatusBadgeClass } from '@/utils/formatters';
import toast from 'react-hot-toast';

const AdminPayments: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    dateFrom: '',
    dateTo: '',
  });
  const [refundModal, setRefundModal] = useState<{ payment: Payment; show: boolean }>({
    payment: {} as Payment,
    show: false,
  });
  const [refundForm, setRefundForm] = useState({
    amount: '',
    reason: '',
  });

  const { data: paymentsData, isLoading, error } = useQuery(
    ['adminPayments', page, searchTerm, filters],
    () => apiService.getAdminPayments({
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

  const refundPaymentMutation = useMutation(
    ({ paymentId, amount, reason }: { paymentId: string; amount?: number; reason?: string }) =>
      apiService.adminRefundPayment(paymentId, amount, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminPayments');
        setRefundModal({ payment: {} as Payment, show: false });
        setRefundForm({ amount: '', reason: '' });
        toast.success('Refund processed successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to process refund');
      },
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

  const handleRefund = (payment: Payment) => {
    setRefundModal({ payment, show: true });
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = refundForm.amount ? parseFloat(refundForm.amount) : undefined;
    if (amount && amount <= 0) {
      toast.error('Refund amount must be greater than 0');
      return;
    }

    refundPaymentMutation.mutate({
      paymentId: refundModal.payment.id,
      amount,
      reason: refundForm.reason || undefined,
    });
  };

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Failed to load payments. Please try again.
        </div>
      </div>
    );
  }

  const payments = paymentsData?.data?.payments || [];
  const pagination = paymentsData?.data?.pagination;

  // Calculate summary statistics
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const successfulPayments = payments.filter(p => p.status === 'SUCCEEDED').length;
  const failedPayments = payments.filter(p => p.status === 'FAILED').length;
  const refundedPayments = payments.filter(p => p.status === 'REFUNDED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor and manage payment transactions, process refunds, and track revenue.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
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
                    Total Amount
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatCurrency(totalAmount)}
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
                <div className="p-3 rounded-md bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Successful
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatNumber(successfulPayments)}
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
                    Failed
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatNumber(failedPayments)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Refunded
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatNumber(refundedPayments)}
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
                    placeholder="Search payments..."
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
                <option value="PROCESSING">Processing</option>
                <option value="SUCCEEDED">Succeeded</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
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

      {/* Payments Table */}
      <div className="card">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No payments found matching your criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">User</th>
                      <th className="table-header-cell">Ride</th>
                      <th className="table-header-cell">Amount</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="table-cell">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {payment.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.user?.name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {payment.ride?.pickupAddress && (
                              <div>
                                <div className="font-medium">From:</div>
                                <div className="text-gray-600">{payment.ride.pickupAddress}</div>
                              </div>
                            )}
                            {payment.ride?.dropoffAddress && (
                              <div className="mt-1">
                                <div className="font-medium">To:</div>
                                <div className="text-gray-600">{payment.ride.dropoffAddress}</div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatCurrency(payment.amount)}
                          </div>
                          {payment.refundAmount && (
                            <div className="text-xs text-red-600">
                              Refunded: {formatCurrency(payment.refundAmount)}
                            </div>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className={getStatusBadgeClass(payment.status)}>
                            {payment.status}
                          </span>
                          {payment.failureReason && (
                            <div className="text-xs text-red-600 mt-1">
                              {payment.failureReason}
                            </div>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-gray-900">
                            {formatDate(payment.createdAt, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {payment.paidAt && (
                            <div className="text-xs text-gray-500">
                              Paid: {formatDate(payment.paidAt)}
                            </div>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            {payment.status === 'SUCCEEDED' && payment.ride && (
                              <button
                                onClick={() => handleRefund(payment)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                              >
                                <ArrowPathIcon className="h-3 w-3 mr-1" />
                                Refund
                              </button>
                            )}
                            <button
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                            >
                              <DocumentArrowDownIcon className="h-3 w-3 mr-1" />
                              Receipt
                            </button>
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

      {/* Refund Modal */}
      {refundModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">​</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleRefundSubmit}>
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <ArrowPathIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Process Refund
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Refund payment for {refundModal.payment.user?.name} - {formatCurrency(refundModal.payment.amount)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Refund Amount (leave empty for full refund)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={refundModal.payment.amount}
                      className="mt-1 input"
                      value={refundForm.amount}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                      Reason (optional)
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 input"
                      value={refundForm.reason}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Reason for refund..."
                    />
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={refundPaymentMutation.isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                  >
                    {refundPaymentMutation.isLoading ? 'Processing...' : 'Process Refund'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundModal({ payment: {} as Payment, show: false })}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;