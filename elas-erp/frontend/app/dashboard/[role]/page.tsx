'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UserSwitcher from '@/app/components/UserSwitcher';
import { ROLE_CONFIGS, filterWidgetsByRole, filterDataByRole, type Role } from '@/app/lib/roleConfig';

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

export default function RoleDashboard() {
  const params = useParams();
  const role = params?.role as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  
  // Get role configuration
  const roleConfig = ROLE_CONFIGS[role as Role] || ROLE_CONFIGS.admin;
  
  // Filter widgets and data based on role
  const filteredWidgets = useMemo(() => {
    return filterWidgetsByRole(widgets, role as Role);
  }, [widgets, role]);
  
  const filteredData = useMemo(() => {
    return filterDataByRole(previewData, role as Role);
  }, [previewData, role]);
  
  // Placeholder chartData for metrics calculation
  const chartData: ChartData[] = [
    { month: 'Jan', revenue: 120, expenses: 80, profit: 40 },
    { month: 'Feb', revenue: 150, expenses: 90, profit: 60 },
    { month: 'Mar', revenue: 180, expenses: 100, profit: 80 },
  ];
  
  // Placeholder insights
  const insights = "Loading AI insights... Please upload your data files to see personalized insights.";

  // Load widgets from localStorage
  useEffect(() => {
    try {
      const uploadResponse = localStorage.getItem('uploadResponse');
      if (uploadResponse) {
        const data = JSON.parse(uploadResponse);
        console.log('📊 Loaded widgets from localStorage:', data.widgets);
        setWidgets(data.widgets || []);
        setPreviewData(data.preview || []);
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

  const expenseData = [
    { category: 'Salaries', value: 450 },
    { category: 'Operations', value: 280 },
    { category: 'Marketing', value: 180 },
    { category: 'Technology', value: 150 },
    { category: 'Other', value: 90 },
  ];

  const recentActivities = [
    { action: 'New project created', user: 'John Doe', time: '2 hours ago', icon: '📁' },
    { action: 'Invoice #1234 paid', user: 'Finance Team', time: '4 hours ago', icon: '💵' },
    { action: 'Team meeting scheduled', user: 'Sarah Smith', time: '6 hours ago', icon: '📅' },
    { action: 'Report generated', user: 'AI Assistant', time: '1 day ago', icon: '📊' },
  ];

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
                <h1 className="text-xl font-bold text-gray-900">VizPilot</h1>
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{roleConfig.icon}</span>
                <span className="text-gray-700 font-medium">{roleConfig.name} Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <span className="text-xl">🔔</span>
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                <span className="text-xl">⚙️</span>
              </button>
              <UserSwitcher />
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
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{metric.label}</span>
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart Area */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="bg-white rounded-xl shadow-md p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin text-4xl mb-2">⚙️</div>
                    <p className="text-gray-600">Loading charts...</p>
                  </div>
                </div>
              ) : filteredWidgets.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>{roleConfig.icon} {roleConfig.name} View:</strong> Showing {filteredWidgets.length} widget(s) 
                      {roleConfig.permissions.canViewAllData ? ' (all data)' : ' (filtered for your role)'}
                    </p>
                  </div>
                  {filteredWidgets.map((widget, idx) => (
                    <div key={widget.id || idx} className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{widget.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {widget.explanation || `${widget.type} visualization`}
                      </p>
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center">
                        <p className="text-4xl mb-2">📊</p>
                        <p className="text-gray-600">
                          {widget.type === 'kpi' ? 'KPI Widget' : 
                           widget.type === 'bar_chart' ? 'Bar Chart' :
                           widget.type === 'line_chart' ? 'Line Chart' :
                           widget.type === 'pie_chart' ? 'Pie Chart' :
                           widget.type === 'table' ? 'Data Table' : 'Widget'}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {filteredData.length} data rows available
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <Link href="/dashboard/admin" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      → View full dashboard (Admin) with all widgets and charts
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="text-center py-8">
                    <p className="text-2xl mb-4">📊</p>
                    <p className="text-gray-600 mb-4">No data uploaded yet</p>
                    <Link 
                      href="/onboarding/upload"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Upload Data Now
                    </Link>
                  </div>
                </div>
              )}

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
                    <div className="whitespace-pre-line">{insights}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
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
