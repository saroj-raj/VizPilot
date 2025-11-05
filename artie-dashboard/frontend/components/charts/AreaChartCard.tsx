'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { chartTheme } from '../../app/utils/chartColors';

interface AreaChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKeys: { key: string; color: string; name: string }[];
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export default function AreaChartCard({
  title,
  subtitle,
  data,
  dataKeys,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
}: AreaChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontSize: chartTheme.legend.fontSize,
                color: chartTheme.legend.fill,
              }}
            />
          )}
          {dataKeys.map((item, index) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.6}
              strokeWidth={2}
              name={item.name}
              animationDuration={1000}
              animationBegin={index * 100}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Footer with summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {data.length} data points
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Export Chart →
        </button>
      </div>
    </div>
  );
}
