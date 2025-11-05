"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import GlobalFiltersBar, { GlobalFilters } from '@/app/components/GlobalFiltersBar';
import RedFlagsStrip, { RedFlag } from '@/app/components/RedFlagsStrip';
import KPITiles, { KPIData } from '@/app/components/KPITiles';
import DSOTrendChart from '@/app/components/DSOTrendChart';
import AgingDistributionChart from '@/app/components/AgingDistributionChart';
import Sparkline, { BalanceSparkline, DSOSparkline } from '@/app/components/Sparkline';
import { 
  formatCurrency, 
  formatCurrencyFull, 
  formatTimestamp,
  abbreviateLabel,
  getAgingBucket,
  getAgingColor,
  calculateDSO
} from '@/lib/utils/formatting';

interface Widget {
  id: string;
  type: string;
  title: string;
  data: any;
  config?: any;
  vega_spec?: any;
  explanation?: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function AdminDashboardEnhanced() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  
  // Global filters state
  const [filters, setFilters] = useState<GlobalFilters>({
    dateRange: null,
    clients: [],
    projectManagers: [],
    agingBuckets: [],
    searchQuery: '',
  });

  // Load data
  useEffect(() => {
    console.log('🔍 Enhanced AdminDashboard - Component mounted');
    
    try {
      const uploadResponseStr = localStorage.getItem('uploadResponse');
      
      if (uploadResponseStr) {
        const uploadResponse = JSON.parse(uploadResponseStr);
        console.log('📊 Loaded widgets:', uploadResponse.widgets?.length || 0);
        
        if (uploadResponse.widgets && Array.isArray(uploadResponse.widgets)) {
          setWidgets(uploadResponse.widgets);
          setPreviewData(uploadResponse.preview || []);
          setLastUpdated(new Date());
          setError(null);
        } else {
          setError('No widgets available. Please upload data first.');
        }
      } else {
        setError('No data found. Please upload and analyze your data first.');
      }
    } catch (err) {
      console.error('❌ Error loading widgets:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Extract available filter options from data
  const filterOptions = useMemo(() => {
    if (!previewData || previewData.length === 0) {
      return {
        clients: [],
        projectManagers: [],
        agingBuckets: ['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
      };
    }

    // Extract unique clients (try ClientName, Client, or CustomerName columns)
    const clientField = ['ClientName', 'Client', 'CustomerName', 'client_name']
      .find(field => previewData[0]?.[field] !== undefined);
    const clients = clientField 
      ? Array.from(new Set(previewData.map(row => row[clientField]).filter(Boolean)))
      : [];

    // Extract unique project managers
    const pmField = ['ProjectManager', 'PM', 'Manager', 'project_manager']
      .find(field => previewData[0]?.[field] !== undefined);
    const projectManagers = pmField
      ? Array.from(new Set(previewData.map(row => row[pmField]).filter(Boolean)))
      : [];

    return {
      clients: clients.sort(),
      projectManagers: projectManagers.sort(),
      agingBuckets: ['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days'],
    };
  }, [previewData]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!previewData || previewData.length === 0) return [];

    let data = [...previewData];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      data = data.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(query)
        )
      );
    }

    // Client filter
    if (filters.clients.length > 0) {
      const clientField = ['ClientName', 'Client', 'CustomerName', 'client_name']
        .find(field => data[0]?.[field] !== undefined);
      if (clientField) {
        data = data.filter(row => filters.clients.includes(row[clientField]));
      }
    }

    // Project Manager filter
    if (filters.projectManagers.length > 0) {
      const pmField = ['ProjectManager', 'PM', 'Manager', 'project_manager']
        .find(field => data[0]?.[field] !== undefined);
      if (pmField) {
        data = data.filter(row => filters.projectManagers.includes(row[pmField]));
      }
    }

    // Aging bucket filter (if Days or Age column exists)
    if (filters.agingBuckets.length > 0) {
      const daysField = ['Days', 'Age', 'DaysOutstanding', 'days']
        .find(field => data[0]?.[field] !== undefined);
      if (daysField) {
        data = data.filter(row => {
          const days = Number(row[daysField]);
          const bucket = getAgingBucket(days);
          return filters.agingBuckets.includes(bucket);
        });
      }
    }

    return data;
  }, [previewData, filters]);

  // Calculate KPIs
  const kpis = useMemo((): KPIData[] => {
    if (filteredData.length === 0) return [];

    // Find relevant columns
    const receivablesField = ['TotalReceivables', 'Total', 'Amount', 'Receivables', 'total_receivables']
      .find(field => filteredData[0]?.[field] !== undefined);
    
    const currentField = ['Current', 'current']
      .find(field => filteredData[0]?.[field] !== undefined);
    
    const days90Field = ['Days90', '90+', 'Past90', 'days_90']
      .find(field => filteredData[0]?.[field] !== undefined);

    // Calculate totals
    const totalAR = receivablesField
      ? filteredData.reduce((sum, row) => sum + (Number(row[receivablesField]) || 0), 0)
      : 0;

    const currentAR = currentField
      ? filteredData.reduce((sum, row) => sum + (Number(row[currentField]) || 0), 0)
      : 0;

    const past90AR = days90Field
      ? filteredData.reduce((sum, row) => sum + (Number(row[days90Field]) || 0), 0)
      : 0;

    const percent90Plus = totalAR > 0 ? (past90AR / totalAR) * 100 : 0;

    // Mock DSO calculation (would need historical sales data in production)
    const dso = calculateDSO(totalAR, totalAR / 45); // Assuming 45 day average

    return [
      {
        id: 'total_ar',
        title: 'Total Receivables',
        value: totalAR,
        previousValue: totalAR * 0.92, // Mock 8% increase
        unit: 'currency',
        description: 'Total outstanding receivables',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        id: 'dso',
        title: 'Days Sales Outstanding',
        value: dso,
        previousValue: dso + 3, // Mock improvement
        unit: 'days',
        description: 'Average collection period',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        id: 'percent_90',
        title: '% in 90+ Days',
        value: percent90Plus,
        previousValue: percent90Plus + 2, // Mock improvement
        unit: 'percentage',
        description: 'Receivables past 90 days',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      },
      {
        id: 'accounts',
        title: 'Active Accounts',
        value: filteredData.length,
        previousValue: previewData.length,
        unit: 'number',
        description: 'Total account records',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
    ];
  }, [filteredData, previewData]);

  // Generate red flags
  const redFlags = useMemo((): RedFlag[] => {
    const flags: RedFlag[] = [];

    // High 90+ concentration
    const percent90Plus = kpis.find(k => k.id === 'percent_90')?.value || 0;
    if (percent90Plus > 20) {
      flags.push({
        id: 'high_90plus',
        severity: 'critical',
        message: `${percent90Plus.toFixed(1)}% of receivables are past 90 days`,
        count: Math.floor(filteredData.length * (percent90Plus / 100)),
        action: () => {
          setFilters(prev => ({ ...prev, agingBuckets: ['90+ Days'] }));
        },
      });
    }

    // High DSO
    const dso = kpis.find(k => k.id === 'dso')?.value || 0;
    if (dso > 45) {
      flags.push({
        id: 'high_dso',
        severity: 'warning',
        message: `DSO is ${dso} days - industry average is ~35-45 days`,
      });
    }

    // Many filtered accounts
    if (filteredData.length < previewData.length * 0.5) {
      flags.push({
        id: 'many_filtered',
        severity: 'info',
        message: `Filters are hiding ${previewData.length - filteredData.length} accounts`,
        action: () => {
          setFilters({
            dateRange: null,
            clients: [],
            projectManagers: [],
            agingBuckets: [],
            searchQuery: '',
          });
        },
      });
    }

    return flags;
  }, [kpis, filteredData, previewData]);

  // Generate DSO trend data (historical 90 days)
  const dsoTrendData = useMemo(() => {
    const currentDSO = kpis.find(k => k.id === 'dso')?.value || 42;
    const data = [];
    const today = new Date();
    
    // Generate 90 days of historical DSO data with realistic fluctuation
    for (let i = 90; i >= 0; i -= 7) { // Weekly data points
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create realistic DSO trend (improving over time with some variance)
      const baseValue = currentDSO + (i / 90) * 8; // Was 8 days worse 90 days ago
      const variance = (Math.sin(i / 7) * 2) + (Math.random() - 0.5) * 3; // Weekly cycle + noise
      const dso = Math.max(30, Math.min(60, baseValue + variance)); // Keep between 30-60
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dso: Math.round(dso * 10) / 10, // Round to 1 decimal
      });
    }
    
    return data;
  }, [kpis]);

  // Generate aging distribution data by client or PM
  const agingDistributionData = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    // Determine grouping field (Client or PM)
    const clientField = ['ClientName', 'Client', 'CustomerName', 'client_name']
      .find(field => filteredData[0]?.[field] !== undefined);
    const pmField = ['ProjectManager', 'PM', 'Manager', 'project_manager']
      .find(field => filteredData[0]?.[field] !== undefined);
    
    const groupField = clientField || pmField;
    if (!groupField) return [];

    // Find aging bucket columns
    const currentCol = ['Current', 'current'].find(f => filteredData[0]?.[f] !== undefined);
    const days30Col = ['Days30', '1-30', 'days_30'].find(f => filteredData[0]?.[f] !== undefined);
    const days60Col = ['Days60', '31-60', 'days_60'].find(f => filteredData[0]?.[f] !== undefined);
    const days90Col = ['Days90', '61-90', 'days_90'].find(f => filteredData[0]?.[f] !== undefined);
    const days90PlusCol = ['Days90Plus', '90+', 'days_90_plus'].find(f => filteredData[0]?.[f] !== undefined);
    const totalCol = ['TotalReceivables', 'Total', 'Amount', 'total'].find(f => filteredData[0]?.[f] !== undefined);

    // Group data by entity (Client or PM)
    const grouped = new Map();
    filteredData.forEach(row => {
      const key = row[groupField];
      if (!key) return;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          name: String(key),
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          days90Plus: 0,
          total: 0,
        });
      }
      
      const entry = grouped.get(key);
      entry.current += Number(row[currentCol] || 0);
      entry.days30 += Number(row[days30Col] || 0);
      entry.days60 += Number(row[days60Col] || 0);
      entry.days90 += Number(row[days90Col] || 0);
      entry.days90Plus += Number(row[days90PlusCol] || 0);
      entry.total += Number(row[totalCol] || 0);
    });

    // Convert to array and sort by total (top 10)
    return Array.from(grouped.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredData]);

  const prepareChartData = (widget: Widget) => {
    const data = filteredData.length > 0 ? filteredData : previewData;
    if (data.length === 0) return [];
    
    const xField = widget.config?.x_column || widget.vega_spec?.encoding?.x?.field;
    const yField = widget.config?.y_column || widget.vega_spec?.encoding?.y?.field;
    
    if (!xField || !yField) return [];
    
    return data.slice(0, 20).map(row => ({
      name: String(row[xField] || ''),
      value: Number(row[yField]) || 0,
      fullName: String(row[xField] || ''), // For tooltip
      [xField]: row[xField],
      [yField]: row[yField],
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-1">
          {payload[0].payload.fullName || label}
        </p>
        <p className="text-sm text-gray-600">
          {formatCurrencyFull(payload[0].value)}
        </p>
      </div>
    );
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 500);
  };

  const handleChartClick = (data: any, widgetId: string) => {
    console.log('📊 Chart clicked:', data, 'Widget:', widgetId);
    setSelectedWidget(widgetId);
    // In production, this would open a drill-through drawer
  };

  const renderWidget = (widget: Widget) => {
    const chartData = prepareChartData(widget);
    const isSelected = selectedWidget === widget.id;
    
    switch (widget.type) {
      case 'bar_chart':
        return (
          <div 
            key={widget.id} 
            className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
                {widget.explanation && (
                  <p className="text-sm text-gray-600 mt-1">{widget.explanation}</p>
                )}
              </div>
              <span 
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded cursor-help"
                title="Bar chart visualization"
              >
                📊 Bar
              </span>
            </div>
            
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart 
                  data={chartData}
                  onClick={(e: any) => e && handleChartClick(e.activePayload?.[0]?.payload, widget.id)}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-30} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => abbreviateLabel(value, 12)}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => formatCurrency(value, 0)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No data matches current filters</p>
              </div>
            )}
          </div>
        );

      case 'line_chart':
        return (
          <div key={widget.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
                {widget.explanation && (
                  <p className="text-sm text-gray-600 mt-1">{widget.explanation}</p>
                )}
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                📈 Line
              </span>
            </div>
            
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-30} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => abbreviateLabel(value, 12)}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => formatCurrency(value, 0)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No data matches current filters</p>
              </div>
            )}
          </div>
        );

      case 'pie_chart':
        const pieData = chartData.slice(0, 6);
        return (
          <div key={widget.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
                {widget.explanation && (
                  <p className="text-sm text-gray-600 mt-1">{widget.explanation}</p>
                )}
              </div>
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded">
                🥧 Pie
              </span>
            </div>
            
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: any) => `${abbreviateLabel(entry.name, 10)} (${formatCurrency(entry.value, 0)})`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No data matches current filters</p>
              </div>
            )}
          </div>
        );

      case 'kpi':
        const value = widget.data?.value || widget.data?.metric_value || 'N/A';
        return (
          <div key={widget.id} className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium opacity-90">{widget.title}</h3>
              <span className="px-2 py-1 bg-white/20 text-xs font-medium rounded">💎 KPI</span>
            </div>
            <div className="text-5xl font-bold mb-2">{value}</div>
            {widget.config?.description && (
              <p className="text-sm opacity-80">{widget.config.description}</p>
            )}
          </div>
        );

      case 'table':
        const tableData = filteredData.length > 0 ? filteredData.slice(0, 10) : previewData.slice(0, 10);
        const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
        
        // Generate sparkline data for each row (simulated historical balance)
        const generateSparklineData = (currentValue: number) => {
          const points = [];
          for (let i = 6; i >= 0; i--) {
            // Simulate historical trend (current value ± random variance)
            const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
            const historicalValue = currentValue * (1 + variance * (i / 6));
            points.push(Math.max(0, historicalValue));
          }
          return points;
        };
        
        return (
          <div key={widget.id} className="bg-white rounded-xl shadow-md p-6 col-span-full hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{widget.title}</h3>
                {widget.explanation && (
                  <p className="text-sm text-gray-600 mt-1">{widget.explanation}</p>
                )}
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                📋 Table
              </span>
            </div>
            
            {tableData.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50"
                          >
                            {col}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tableData.map((row, idx) => {
                        // Find the primary balance/amount column for sparkline
                        const balanceField = ['TotalReceivables', 'Total', 'Amount', 'Balance', 'total']
                          .find(field => row[field] !== undefined);
                        const balanceValue = balanceField ? Number(row[balanceField]) : 0;
                        const sparklineData = generateSparklineData(balanceValue);
                        
                        return (
                          <tr key={idx} className="hover:bg-blue-50 transition-colors">
                            {columns.map((col) => {
                              const value = row[col];
                              const isNumeric = typeof value === 'number';
                              return (
                                <td 
                                  key={col} 
                                  className={`px-4 py-3 whitespace-nowrap text-sm ${
                                    isNumeric ? 'text-right font-medium text-gray-900' : 'text-gray-700'
                                  }`}
                                >
                                  {value !== null && value !== undefined 
                                    ? (isNumeric && (col.toLowerCase().includes('total') || col.toLowerCase().includes('amount'))
                                        ? formatCurrencyFull(value)
                                        : String(value))
                                    : '-'}
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <BalanceSparkline data={sparklineData} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredData.length > 10 && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Showing 10 of {filteredData.length} filtered rows
                    {filteredData.length < previewData.length && ` (${previewData.length} total)`}
                  </p>
                )}
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No data matches current filters</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={widget.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-semibold mb-2">
                ⚠️ Unsupported widget type: "{widget.type}"
              </p>
              <p className="text-xs text-gray-600">
                Expected: bar_chart, line_chart, pie_chart, kpi, table
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏢 Elas ERP</h1>
              <p className="text-sm text-gray-600">
                Admin Dashboard • {formatTimestamp(lastUpdated)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>

              <div className="h-8 w-px bg-gray-300"></div>

              {/* Role Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
                  title="Switch between different role dashboards"
                >
                  <span className="text-xl">👑</span>
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
                      <span className="text-sm font-semibold text-blue-600">Admin (Current)</span>
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
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@elas-erp.com'}</p>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md"
                  title="Logout from your account"
                >
                  Logout
                </button>
              </div>

              <Link
                href="/onboarding/upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Upload New Data
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link
              href="/onboarding/upload"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
            >
              Upload Data Now →
            </Link>
          </div>
        ) : (
          <>
            {/* Global Filters */}
            <GlobalFiltersBar
              filters={filters}
              onFiltersChange={setFilters}
              availableClients={filterOptions.clients}
              availableProjectManagers={filterOptions.projectManagers}
              availableAgingBuckets={filterOptions.agingBuckets}
            />

            {/* Red Flags */}
            <RedFlagsStrip flags={redFlags} />

            {/* KPIs */}
            <KPITiles kpis={kpis} loading={false} />

            {/* Phase C: Advanced Visualizations */}
            <div className="space-y-6 mb-6">
              {/* DSO Trend Chart */}
              {dsoTrendData.length > 0 && (
                <DSOTrendChart data={dsoTrendData} targetDSO={45} />
              )}

              {/* Aging Distribution Chart */}
              {agingDistributionData.length > 0 && (
                <AgingDistributionChart data={agingDistributionData} viewMode="stacked" />
              )}
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {widgets.map((widget) => renderWidget(widget))}
            </div>

            {/* Footer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>Displaying:</strong> {filteredData.length} of {previewData.length} records
                  {filteredData.length < previewData.length && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Filtered
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {widgets.length} widgets • Powered by Groq AI & Recharts
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
