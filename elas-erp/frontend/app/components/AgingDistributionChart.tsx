"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, getAgingColor } from '@/lib/utils/formatting';

interface AgingData {
  name: string;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days90Plus: number;
  total: number;
}

interface AgingDistributionChartProps {
  data: AgingData[];
  viewMode?: 'stacked' | 'percentage';
}

export default function AgingDistributionChart({ 
  data, 
  viewMode = 'stacked' 
}: AgingDistributionChartProps) {
  const [mode, setMode] = React.useState(viewMode);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📊 Aging Distribution Analysis
        </h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No aging data available</p>
        </div>
      </div>
    );
  }

  // Calculate percentage data for 100% stacked view
  const percentageData = data.map(item => {
    const total = item.total || 1;
    return {
      name: item.name,
      current: (item.current / total) * 100,
      days30: (item.days30 / total) * 100,
      days60: (item.days60 / total) * 100,
      days90: (item.days90 / total) * 100,
      days90Plus: (item.days90Plus / total) * 100,
      total: 100,
    };
  });

  const displayData = mode === 'percentage' ? percentageData : data;

  // Calculate totals for summary
  const totals = {
    current: data.reduce((sum, d) => sum + d.current, 0),
    days30: data.reduce((sum, d) => sum + d.days30, 0),
    days60: data.reduce((sum, d) => sum + d.days60, 0),
    days90: data.reduce((sum, d) => sum + d.days90, 0),
    days90Plus: data.reduce((sum, d) => sum + d.days90Plus, 0),
    total: data.reduce((sum, d) => sum + d.total, 0),
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const originalData = data.find(d => d.name === label);
    if (!originalData) return null;

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[200px]">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('Current') }}></span>
              Current:
            </span>
            <span className="font-medium">{formatCurrency(originalData.current)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('1-30 Days') }}></span>
              1-30 Days:
            </span>
            <span className="font-medium">{formatCurrency(originalData.days30)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('31-60 Days') }}></span>
              31-60 Days:
            </span>
            <span className="font-medium">{formatCurrency(originalData.days60)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('61-90 Days') }}></span>
              61-90 Days:
            </span>
            <span className="font-medium">{formatCurrency(originalData.days90)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('90+ Days') }}></span>
              90+ Days:
            </span>
            <span className="font-medium text-red-600">{formatCurrency(originalData.days90Plus)}</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(originalData.total)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow col-span-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            📊 Aging Distribution by {data[0]?.name.includes('PM') ? 'Project Manager' : 'Client'}
          </h3>
          <p className="text-sm text-gray-600">
            Receivables breakdown by aging buckets
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('stacked')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'stacked' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            $ Amount
          </button>
          <button
            onClick={() => setMode('percentage')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              mode === 'percentage' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            % Share
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={displayData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => mode === 'percentage' ? `${value}%` : formatCurrency(value, 0)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          
          <Bar dataKey="current" stackId="a" fill={getAgingColor('Current')} name="Current" />
          <Bar dataKey="days30" stackId="a" fill={getAgingColor('1-30 Days')} name="1-30 Days" />
          <Bar dataKey="days60" stackId="a" fill={getAgingColor('31-60 Days')} name="31-60 Days" />
          <Bar dataKey="days90" stackId="a" fill={getAgingColor('61-90 Days')} name="61-90 Days" />
          <Bar dataKey="days90Plus" stackId="a" fill={getAgingColor('90+ Days')} name="90+ Days" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('Current') }}></span>
            <div className="text-xs text-gray-500">Current</div>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(totals.current)}
          </div>
          <div className="text-xs text-gray-500">
            {((totals.current / totals.total) * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('1-30 Days') }}></span>
            <div className="text-xs text-gray-500">1-30 Days</div>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(totals.days30)}
          </div>
          <div className="text-xs text-gray-500">
            {((totals.days30 / totals.total) * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('31-60 Days') }}></span>
            <div className="text-xs text-gray-500">31-60 Days</div>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(totals.days60)}
          </div>
          <div className="text-xs text-gray-500">
            {((totals.days60 / totals.total) * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('61-90 Days') }}></span>
            <div className="text-xs text-gray-500">61-90 Days</div>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(totals.days90)}
          </div>
          <div className="text-xs text-gray-500">
            {((totals.days90 / totals.total) * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getAgingColor('90+ Days') }}></span>
            <div className="text-xs text-gray-500 font-semibold">90+ Days</div>
          </div>
          <div className="text-sm font-semibold text-red-600">
            {formatCurrency(totals.days90Plus)}
          </div>
          <div className="text-xs text-red-600 font-medium">
            {((totals.days90Plus / totals.total) * 100).toFixed(1)}% ⚠️
          </div>
        </div>
      </div>
    </div>
  );
}
