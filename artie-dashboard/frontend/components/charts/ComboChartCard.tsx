'use client';
import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartTheme } from '../../app/utils/chartColors';

interface ComboChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  xAxisKey: string;
  barKeys: { key: string; color: string; name: string }[];
  lineKeys: { key: string; color: string; name: string }[];
  height?: number;
  showGrid?: boolean;
}

export default function ComboChartCard({
  title,
  subtitle,
  data,
  xAxisKey,
  barKeys,
  lineKeys,
  height = 300,
  showGrid = true,
}: ComboChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              stroke={chartTheme.grid.stroke}
              strokeDasharray={chartTheme.grid.strokeDasharray}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            stroke={chartTheme.axis.stroke}
            style={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
          />
          <YAxis
            stroke={chartTheme.axis.stroke}
            style={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltip.background,
              border: chartTheme.tooltip.border,
              borderRadius: chartTheme.tooltip.borderRadius,
              padding: chartTheme.tooltip.padding,
              color: chartTheme.tooltip.color,
              fontSize: chartTheme.tooltip.fontSize,
              fontWeight: chartTheme.tooltip.fontWeight,
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: chartTheme.legend.fontSize,
              color: chartTheme.legend.fill,
            }}
          />
          {barKeys.map((item, index) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              fill={item.color}
              name={item.name}
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
              animationBegin={index * 100}
            />
          ))}
          {lineKeys.map((item, index) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              stroke={item.color}
              strokeWidth={2}
              name={item.name}
              dot={{ r: 4 }}
              animationDuration={1000}
              animationBegin={(barKeys.length + index) * 100}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Combined view: {barKeys.length} bar series, {lineKeys.length} line series
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Analyze Trends →
        </button>
      </div>
    </div>
  );
}
