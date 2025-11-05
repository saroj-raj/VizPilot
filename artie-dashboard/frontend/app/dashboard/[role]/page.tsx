'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import MetricCardWithSparkline from '../../components/charts/MetricCardWithSparkline';
import AreaChartCard from '../../components/charts/AreaChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import ComboChartCard from '../../components/charts/ComboChartCard';
import { chartColors } from '../../utils/chartColors';

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface Widget {
  id: string;
  type: string;
  title: string;
  data: any;
  config?: any;
}

export default function RoleDashboard({ params }: { params: { role: string } }) {
  const { role } = params;
  const router = useRouter();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // Enhanced sample data for charts
  const chartData: ChartData[] = [
    { month: 'Jan', revenue: 120, expenses: 80, profit: 40 },
    { month: 'Feb', revenue: 150, expenses: 90, profit: 60 },
    { month: 'Mar', revenue: 180, expenses: 100, profit: 80 },
    { month: 'Apr', revenue: 195, expenses: 105, profit: 90 },
    { month: 'May', revenue: 210, expenses: 110, profit: 100 },
    { month: 'Jun', revenue: 245, expenses: 115, profit: 130 },
  ];

  // Expense breakdown data
  const expenseData = [
    { category: 'Salaries', value: 180, percentage: 36 },
    { category: 'Operations', value: 120, percentage: 24 },
    { category: 'Marketing', value: 90, percentage: 18 },
    { category: 'Technology', value: 75, percentage: 15 },
    { category: 'Other', value: 35, percentage: 7 },
  ];

  // Regional sales data
  const regionalData = [
    { region: 'West', sales: 120 },
    { region: 'East', sales: 95 },
    { region: 'North', sales: 65 },
    { region: 'South', sales: 30 },
  ];

  // Sparkline data for metric cards
  const revenueSparkline = [100, 110, 120, 150, 180, 195, 210, 245];
  const expenseSparkline = [70, 75, 80, 90, 100, 105, 110, 115];
  const profitSparkline = [30, 35, 40, 60, 80, 90, 100, 130];
  
  // Role-specific insights
  const roleInsights = {
    admin: "📊 System Overview: All departments performing well\n\n✅ Revenue up 12% this quarter\n\n⚠️ 3 pending approvals require attention\n\n💡 Recommend: Review Q4 budget allocations",
    finance: "💰 Financial Health: Strong cash flow position\n\n📈 Profit margin improved to 38%\n\n⚠️ 2 invoices overdue - follow up needed\n\n💡 Recommend: Invest surplus in growth initiatives",
    manager: "📊 Team Performance: Above target metrics\n\n✅ Project delivery on schedule\n\n⚠️ 3 team members need timesheet updates\n\n💡 Recommend: Schedule 1-on-1s this week",
    employee: "👤 Your Dashboard: Stay productive\n\n✅ 5 tasks completed this week\n\n⚠️ 2 pending tasks due tomorrow\n\n💡 Tip: Review upcoming deadlines",
  };
  const insights = roleInsights[role as keyof typeof roleInsights] || "Loading AI insights... Please upload your data files to see personalized insights.";

  const roleConfig = {
    admin: { name: 'Administrator', icon: '👑', color: 'blue' },
    manager: { name: 'Manager', icon: '📊', color: 'purple' },
    employee: { name: 'Employee', icon: '👤', color: 'green' },
    finance: { name: 'Finance', icon: '💰', color: 'orange' },
  }[role] || { name: 'User', icon: '👤', color: 'gray' };

  // Load widgets from localStorage
  useEffect(() => {
    try {
      const uploadResponse = localStorage.getItem('uploadResponse');
      if (uploadResponse) {
        const data = JSON.parse(uploadResponse);
        console.log('📊 Loaded widgets from localStorage:', data.widgets);
        setWidgets(data.widgets || []);
      } else {
        console.log('⚠️ No uploadResponse found in localStorage');
      }
    } catch (err) {
      console.error('Error loading widgets:', err);
    }
    setLoading(false);
  }, []);

  // TODO: Re-enable once Chart and groq files are fixed
  /*
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Check if user uploaded documents or using historical data
      const useHistoricalData = localStorage.getItem('useHistoricalData') === 'true';
      const businessInfo = JSON.parse(localStorage.getItem('businessInfo') || '{}');

      // Generate or fetch financial data
      const financialData = await generateHistoricalData(
        businessInfo.industry || 'Technology',
        businessInfo.size || '11-50 employees'
      );

      // Transform data for charts
      const transformedData: ChartData[] = financialData.months.map((month, i) => ({
        month,
        revenue: financialData.revenue[i],
        expenses: financialData.expenses[i],
        profit: financialData.profit[i],
      }));

      setChartData(transformedData);

      // Get AI insights
      if (businessInfo.businessName) {
        const aiInsights = await getBusinessInsights({
          name: businessInfo.businessName,
          industry: businessInfo.industry,
          size: businessInfo.size,
          hasDocuments: !useHistoricalData,
        });
        setInsights(aiInsights);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setInsights('Unable to load AI insights at this time.');
      setLoading(false);
    }
  };
  */

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory([...chatHistory, { role: 'user', content: userMessage }]);

    // TODO: Re-enable once groq is fixed
    /*
    try {
      const response = await getChatResponse(userMessage, chatHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })));
      
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response },
      ]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      setChatHistory([
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    }
    */
  };

  const metrics = chartData.length > 0 ? [
    {
      label: 'Total Revenue',
      value: `$${chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(0)}k`,
      change: '+12.5%',
      trend: 'up'
    },
    {
      label: 'Total Expenses',
      value: `$${chartData.reduce((sum, d) => sum + d.expenses, 0).toFixed(0)}k`,
      change: '+8.3%',
      trend: 'up'
    },
    {
      label: 'Net Profit',
      value: `$${chartData.reduce((sum, d) => sum + d.profit, 0).toFixed(0)}k`,
      change: '+18.2%',
      trend: 'up'
    },
    {
      label: 'Avg Monthly Revenue',
      value: `$${(chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.length).toFixed(0)}k`,
      change: '+5.1%',
      trend: 'up'
    },
  ] : [];

  const recentActivities = [
    { action: 'New project created', user: 'John Doe', time: '2 hours ago', icon: '📁' },
    { action: 'Invoice #1234 paid', user: 'Finance Team', time: '4 hours ago', icon: '💵' },
    { action: 'Team meeting scheduled', user: 'Sarah Smith', time: '6 hours ago', icon: '📅' },
    { action: 'Report generated', user: 'AI Assistant', time: '1 day ago', icon: '📊' },
  ];

  // Show loading while checking authentication
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

  // Redirect handled in useEffect, but show nothing if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Elas ERP</h1>
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{roleConfig.icon}</span>
                <span className="text-gray-700 font-medium">{roleConfig.name} Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900" title="Notifications">
                <span className="text-xl">🔔</span>
              </button>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              {/* Role Switcher - More Visible */}
              <div className="relative">
                <button 
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
                  title="Switch between different role dashboards"
                >
                  <span className="text-xl">{roleConfig.icon}</span>
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
                      <span className="text-sm">Finance</span>
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
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
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
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">📊</span> Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'projects'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">📁</span> Projects
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'team'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">👥</span> Team
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'reports'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">📈</span> Reports
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">⚙️</span> Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Vibrant Metrics Grid with Sparklines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCardWithSparkline
              label="Total Revenue"
              value="$1.1M"
              change="+12.5%"
              trend="up"
              gradientColors={chartColors.revenue.gradient}
              icon="💰"
              sparklineData={revenueSparkline}
            />
            <MetricCardWithSparkline
              label="Total Expenses"
              value="$680k"
              change="+8.3%"
              trend="up"
              gradientColors={chartColors.expenses.gradient}
              icon="📊"
              sparklineData={expenseSparkline}
            />
            <MetricCardWithSparkline
              label="Net Profit"
              value="$420k"
              change="+18.2%"
              trend="up"
              gradientColors={chartColors.profit.gradient}
              icon="💎"
              sparklineData={profitSparkline}
            />
            <MetricCardWithSparkline
              label="Growth Rate"
              value="38%"
              change="+5.1%"
              trend="up"
              gradientColors={chartColors.operations.gradient}
              icon="📈"
              sparklineData={[30, 32, 34, 35, 36, 37, 38, 38]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Revenue Trend Area Chart */}
              <AreaChartCard
                title="Revenue Trend"
                subtitle="Last 6 months performance"
                data={chartData}
                xAxisKey="month"
                dataKeys={[
                  { key: 'revenue', color: chartColors.revenue.primary, name: 'Revenue' },
                  { key: 'expenses', color: chartColors.expenses.primary, name: 'Expenses' },
                ]}
                height={300}
              />

              {/* Combo Chart: Revenue vs Profit */}
              <ComboChartCard
                title="Revenue & Profit Analysis"
                subtitle="Bar: Revenue & Expenses | Line: Profit margin"
                data={chartData}
                xAxisKey="month"
                barKeys={[
                  { key: 'revenue', color: chartColors.revenue.primary, name: 'Revenue' },
                  { key: 'expenses', color: chartColors.expenses.primary, name: 'Expenses' },
                ]}
                lineKeys={[
                  { key: 'profit', color: chartColors.profit.primary, name: 'Profit' },
                ]}
                height={300}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6 border border-blue-200">
                <div className="flex items-start space-x-3 mb-4">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                    <p className="text-sm text-gray-600">Powered by Groq AI</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {loading ? (
                    <p className="italic">Generating insights...</p>
                  ) : (
                    <div className="whitespace-pre-line">
                      {insights || "📊 Revenue up 12% this quarter\n\n⚠️ Expenses rising 8% - watch costs\n\n💡 Profit margin improved to 38%\n\n✨ Recommend: Hire 2 sales reps"}
                    </div>
                  )}
                </div>
              </div>

              {/* Expense Breakdown Donut */}
              <DonutChartCard
                title="Expense Breakdown"
                subtitle="By category"
                data={expenseData}
                nameKey="category"
                valueKey="value"
                height={250}
                showLegend={false}
                centerLabel="Total"
                centerValue="$500k"
              />
            </div>
          </div>

          {/* Second Row: Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <BarChartCard
              title="Sales by Region"
              subtitle="Performance comparison"
              data={regionalData}
              dataKey="sales"
              xAxisKey="region"
              height={300}
              barColor={chartColors.profit.primary}
              useMultiColor={true}
            />

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.user}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                <span className="text-3xl mb-2">➕</span>
                <span className="text-sm font-medium text-gray-700">New Project</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
                <span className="text-3xl mb-2">👤</span>
                <span className="text-sm font-medium text-gray-700">Add Member</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                <span className="text-3xl mb-2">📄</span>
                <span className="text-sm font-medium text-gray-700">Generate Report</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition">
                <span className="text-3xl mb-2">💬</span>
                <span className="text-sm font-medium text-gray-700">Chat Support</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Floating AI Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-3xl hover:shadow-xl transition z-50"
      >
        {chatOpen ? '✕' : '🤖'}
      </button>

      {/* AI Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-xl">
            <h3 className="text-white font-semibold">Elas AI Assistant</h3>
            <p className="text-blue-100 text-sm">Powered by Groq</p>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl mb-2 block">👋</span>
                <p>Ask me anything about your business!</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
