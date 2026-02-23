'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UserSwitcher from '@/app/components/UserSwitcher';
import DashboardCommandBox, { DashboardCommand } from '@/app/components/DashboardCommandBox';
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
  const [refining, setRefining] = useState(false);
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

  const handleCommandApply = async (command: DashboardCommand) => {
    setRefining(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/dashboard/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_id: 'current-dashboard',
          dataset_id: 'current-dataset',
          role: command.role,
          user_instruction: command.userInstruction,
          constraints: {
            domain: command.domain,
            intent: command.intent,
            chartType: command.chartType,
            timeRange: command.timeRange,
          },
          current_widgets: widgets,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refine dashboard: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✨ Dashboard refined:', data);

      // Update widgets with refined versions
      setWidgets(data.widgets);

      // Store in localStorage
      localStorage.setItem('dashboardRefinement', JSON.stringify({
        timestamp: new Date().toISOString(),
        command,
        widgets: data.widgets,
        mode: data.mode,
      }));
    } catch (err) {
      console.error('Error refining dashboard:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to refine dashboard'}`);
    } finally {
      setRefining(false);
    }
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Dashboard (temporary)</h2>
        <p className="text-sm text-gray-500">Simplified placeholder to allow build verification.</p>
      </div>
    </div>
  );
}
