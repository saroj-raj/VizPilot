'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getCategoryColor, chartTheme } from '../../app/utils/chartColors';

interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  nameKey: string;
  valueKey: string;
  height?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChartCard({
  title,
  subtitle,
  data,
  nameKey,
  valueKey,
  height = 300,
  showLegend = true,
  centerLabel,
  centerValue,
}: DonutChartCardProps) {
  // Calculate total
  const total = data.reduce((sum, item) => sum + item[valueKey], 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height * 0.25}
              outerRadius={height * 0.35}
              paddingAngle={4}
              dataKey={valueKey}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
              ))}
            </Pie>
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
              formatter={(value: number) => {
                const percentage = ((value / total) * 100).toFixed(1);
                return [`${value.toLocaleString()} (${percentage}%)`, ''];
              }}
            />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  fontSize: chartTheme.legend.fontSize,
                  color: chartTheme.legend.fill,
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              {centerLabel && (
                <div className="text-sm text-gray-600 font-medium">{centerLabel}</div>
              )}
              {centerValue && (
                <div className="text-2xl font-bold text-gray-900">{centerValue}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data breakdown */}
      <div className="mt-6 space-y-2">
        {data.slice(0, 5).map((item, index) => {
          const percentage = ((item[valueKey] / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(index) }}
                />
                <span className="text-gray-700">{item[nameKey]}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-900 font-medium">
                  ${item[valueKey].toLocaleString()}
                </span>
                <span className="text-gray-500">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
