'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { chartTheme, getCategoryColor } from '../../app/utils/chartColors';

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
  barColor?: string;
  useMultiColor?: boolean;
  showGrid?: boolean;
  horizontal?: boolean;
}

export default function BarChartCard({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey,
  height = 300,
  barColor = '#3B82F6',
  useMultiColor = false,
  showGrid = true,
  horizontal = false,
}: BarChartCardProps) {
  const ChartComponent = BarChart;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 10, left: horizontal ? 60 : 0, bottom: 0 }}
        >
          {showGrid && (
            <CartesianGrid
              stroke={chartTheme.grid.stroke}
              strokeDasharray={chartTheme.grid.strokeDasharray}
            />
          )}
          {horizontal ? (
            <>
              <XAxis
                type="number"
                stroke={chartTheme.axis.stroke}
                style={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                stroke={chartTheme.axis.stroke}
                style={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                stroke={chartTheme.axis.stroke}
                style={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
              />
              <YAxis
                stroke={chartTheme.axis.stroke}
                style={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
              />
            </>
          )}
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
          <Bar
            dataKey={dataKey}
            fill={barColor}
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
            animationBegin={0}
          >
            {useMultiColor &&
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
              ))}
          </Bar>
        </ChartComponent>
      </ResponsiveContainer>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {data.length} {horizontal ? 'categories' : 'items'}
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View Details →
        </button>
      </div>
    </div>
  );
}
