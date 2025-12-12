import React from 'react';
import { useQuery } from 'react-query';
import { 
  ChartBarIcon, 
  UsersIcon, 
  TruckIcon, 
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    ['adminDashboard', '30d'],
    () => apiService.getDashboardMetrics('30d'),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: revenueData, isLoading: revenueLoading } = useQuery(
    ['adminRevenue', '30d'],
    () => apiService.getRevenueAnalytics('30d')
  );

  if (isLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Failed to load dashboard data. Please try again.
        </div>
      </div>
    );
  }

  const { metrics, growth, recentTransactions } = dashboardData?.data || {};

  const kpiCards = [
    {
      title: 'Total Users',
      value: formatNumber(metrics?.totalUsers || 0),
      icon: UsersIcon,
      color: 'bg-blue-500',
      growth: 0, // You could calculate this from historical data
    },
    {
      title: 'Active Drivers',
      value: formatNumber(metrics?.activeDrivers || 0),
      icon: TruckIcon,
      color: 'bg-green-500',
      growth: 0,
    },
    {
      title: 'Total Rides',
      value: formatNumber(metrics?.totalRides || 0),
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      growth: growth?.rides || 0,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics?.totalRevenue || 0),
      icon: CreditCardIcon,
      color: 'bg-yellow-500',
      growth: growth?.revenue || 0,
    },
    {
      title: 'Today Rides',
      value: formatNumber(metrics?.todayRides || 0),
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      growth: 0,
    },
    {
      title: 'Today Revenue',
      value: formatCurrency(metrics?.todayRevenue || 0),
      icon: CreditCardIcon,
      color: 'bg-pink-500',
      growth: 0,
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const rideStatusData = [
    { name: 'Completed', value: metrics?.completedRides || 0, color: '#10B981' },
    { name: 'In Progress', value: 0, color: '#F59E0B' }, // You would calculate this
    { name: 'Pending', value: 0, color: '#6B7280' }, // You would calculate this
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening with your ride-sharing platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${kpi.color} p-3 rounded-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {kpi.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {kpi.value}
                        </div>
                        {kpi.growth !== 0 && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            kpi.growth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {kpi.growth > 0 ? (
                              <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                            )}
                            <span className="ml-1">{Math.abs(kpi.growth).toFixed(1)}%</span>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Revenue Trend (Last 30 Days)</h3>
          </div>
          <div className="card-body">
            {revenueData?.data?.chartData && revenueData.data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData.data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    labelFormatter={(date) => formatDate(date)}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Ride Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Ride Status Distribution</h3>
          </div>
          <div className="card-body">
            {rideStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rideStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {rideStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'Rides']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No ride data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="card-body p-0">
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">User</th>
                    <th className="table-header-cell">Type</th>
                    <th className="table-header-cell">Amount</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {transaction.user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.user?.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-info">
                          {transaction.type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`font-medium ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${
                          transaction.status === 'SUCCEEDED' ? 'badge-success' :
                          transaction.status === 'FAILED' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No recent transactions
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/drivers"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <TruckIcon className="h-10 w-10 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  Manage Drivers ({metrics?.pendingDrivers || 0} pending)
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Approve and review driver applications
                </p>
              </div>
            </a>

            <a
              href="/admin/users"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <UsersIcon className="h-10 w-10 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  Manage Users
                </p>
                <p className="text-sm text-gray-500 truncate">
                  View and manage user accounts
                </p>
              </div>
            </a>

            <a
              href="/admin/rides"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-10 w-10 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  View Rides
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Monitor all ride activities
                </p>
              </div>
            </a>

            <a
              href="/admin/payments"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-10 w-10 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  Payment History
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Track all payment transactions
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;