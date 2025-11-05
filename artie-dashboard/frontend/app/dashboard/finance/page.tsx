'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function FinanceDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Finance-specific data
  const cashFlowData = [
    { month: 'Jan', inflow: 450, outflow: 320, net: 130 },
    { month: 'Feb', inflow: 520, outflow: 350, net: 170 },
    { month: 'Mar', inflow: 580, outflow: 380, net: 200 },
    { month: 'Apr', inflow: 610, outflow: 400, net: 210 },
    { month: 'May', inflow: 680, outflow: 420, net: 260 },
    { month: 'Jun', inflow: 750, outflow: 450, net: 300 },
  ];

  const expensesByCategory = [
    { category: 'Salaries', amount: 280000, percentage: 42 },
    { category: 'Operations', amount: 150000, percentage: 22 },
    { category: 'Marketing', amount: 90000, percentage: 13 },
    { category: 'Technology', amount: 80000, percentage: 12 },
    { category: 'Other', amount: 75000, percentage: 11 },
  ];

  const arAgingData = [
    { bucket: 'Current', amount: 450000 },
    { bucket: '1-30 Days', amount: 180000 },
    { bucket: '31-60 Days', amount: 90000 },
    { bucket: '61-90 Days', amount: 45000 },
    { bucket: '90+ Days', amount: 35000 },
  ];

  const revenueByClient = [
    { client: 'Acme Corp', revenue: 280000 },
    { client: 'Tech Solutions', revenue: 210000 },
    { client: 'Global Industries', revenue: 190000 },
    { client: 'Innovation Ltd', revenue: 165000 },
    { client: 'Enterprise Co', revenue: 155000 },
  ];

  const budgetVsActual = [
    { category: 'Sales', budget: 500, actual: 520, variance: 20 },
    { category: 'Marketing', budget: 100, actual: 90, variance: -10 },
    { category: 'Operations', budget: 200, actual: 210, variance: 10 },
    { category: 'R&D', budget: 150, actual: 145, variance: -5 },
    { category: 'Admin', budget: 80, actual: 75, variance: -5 },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Elas ERP</h1>
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💰</span>
                <span className="text-gray-700 font-medium">Finance Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900" title="Notifications">
                <span className="text-xl">🔔</span>
              </button>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              {/* Role Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
                  title="Switch between different role dashboards"
                >
                  <span className="text-xl">💰</span>
                  <span className="text-sm font-medium">Switch Role</span>
                  <span className="text-xs">▼</span>
                </button>
                
                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => { router.push('/dashboard/admin'); setShowRoleSwitcher(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <span>👑</span>
                      <span className="text-sm">Admin</span>
                    </button>
                    <button
                      onClick={() => { router.push('/dashboard/finance'); setShowRoleSwitcher(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <span>💰</span>
                      <span className="text-sm font-semibold text-blue-600">Finance (Current)</span>
                    </button>
                    <button
                      onClick={() => { router.push('/dashboard/manager'); setShowRoleSwitcher(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <span>📊</span>
                      <span className="text-sm">Manager</span>
                    </button>
                    <button
                      onClick={() => { router.push('/dashboard/employee'); setShowRoleSwitcher(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <span>👤</span>
                      <span className="text-sm">Employee</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-300"></div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Finance User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md"
                  title="Logout from your account"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'overview' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">📊</span> Overview
            </button>
            <button
              onClick={() => setActiveTab('ar')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'ar' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">💵</span> Accounts Receivable
            </button>
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'cashflow' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">💸</span> Cash Flow
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'budget' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">📈</span> Budget Analysis
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'reports' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">📄</span> Financial Reports
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-4xl font-bold mb-2">$3.87M</div>
              <p className="text-sm opacity-80">↑ 12.5% from last month</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Accounts Receivable</h3>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-4xl font-bold mb-2">$800K</div>
              <p className="text-sm opacity-80">42 days DSO</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Cash Flow</h3>
                <span className="text-2xl">💸</span>
              </div>
              <div className="text-4xl font-bold mb-2">$1.27M</div>
              <p className="text-sm opacity-80">↑ 8.3% positive flow</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium opacity-90">Expenses</h3>
                <span className="text-2xl">📉</span>
              </div>
              <div className="text-4xl font-bold mb-2">$675K</div>
              <p className="text-sm opacity-80">17.4% of revenue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Cash Flow Trend */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10b981" fill="#10b981" name="Cash Inflow" />
                  <Area type="monotone" dataKey="outflow" stackId="2" stroke="#ef4444" fill="#ef4444" name="Cash Outflow" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry) => `${entry.category} (${entry.percentage}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* AR Aging */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AR Aging Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={arAgingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Client */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByClient} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="client" type="category" width={120} />
                  <Tooltip formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`} />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget vs Actual */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual (This Month)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value}K`} />
                <Legend />
                <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
