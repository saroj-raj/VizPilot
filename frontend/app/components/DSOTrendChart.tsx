"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatting';

interface DSOTrendData {
  date: string;
  dso: number;
  target?: number;
}

interface DSOTrendChartProps {
  data: DSOTrendData[];
  targetDSO?: number;
}

export default function DSOTrendChart({ data, targetDSO = 45 }: DSOTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📈 DSO Trend Analysis
        </h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No historical data available for DSO trend</p>
        </div>
      </div>
    );
  }

  const currentDSO = data[data.length - 1]?.dso || 0;
  const previousDSO = data[data.length - 2]?.dso || currentDSO;
  const change = currentDSO - previousDSO;
  const isImproving = change < 0;
  const isAboveTarget = currentDSO > targetDSO;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-blue-600 font-medium">
          DSO: {payload[0].value} days
        </p>
        {targetDSO && (
          <p className="text-xs text-gray-500">
            Target: {targetDSO} days
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            📈 Days Sales Outstanding (DSO) Trend
          </h3>
          <p className="text-sm text-gray-600">
            Cash collection efficiency over time
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(currentDSO)} days
          </div>
          <div className={`text-sm font-medium flex items-center justify-end gap-1 ${
            isImproving ? 'text-green-600' : 'text-red-600'
          }`}>
            {isImproving ? '↓' : '↑'} {Math.abs(change).toFixed(1)} days
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`mb-4 px-4 py-2 rounded-lg ${
        isAboveTarget 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            isAboveTarget ? 'text-red-800' : 'text-green-800'
          }`}>
            {isAboveTarget 
              ? `⚠️ ${Math.round(currentDSO - targetDSO)} days above target`
              : `✅ ${Math.round(targetDSO - currentDSO)} days under target`
            }
          </span>
          <span className="text-xs text-gray-600">
            Industry benchmark: 35-45 days
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Target line */}
          <ReferenceLine 
            y={targetDSO} 
            stroke="#f59e0b" 
            strokeDasharray="5 5"
            label={{ value: 'Target', position: 'right', fill: '#f59e0b', fontSize: 11 }}
          />
          
          {/* DSO line */}
          <Line 
            type="monotone" 
            dataKey="dso" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="DSO"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <div className="text-xs text-gray-500 mb-1">Average DSO</div>
          <div className="text-sm font-semibold text-gray-900">
            {Math.round(data.reduce((sum, d) => sum + d.dso, 0) / data.length)} days
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Best DSO</div>
          <div className="text-sm font-semibold text-green-600">
            {Math.round(Math.min(...data.map(d => d.dso)))} days
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Worst DSO</div>
          <div className="text-sm font-semibold text-red-600">
            {Math.round(Math.max(...data.map(d => d.dso)))} days
          </div>
        </div>
      </div>
    </div>
  );
}
