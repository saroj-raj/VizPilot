'use client';
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getGradientStyle } from '../../app/utils/chartColors';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  gradientColors: string[];
  icon?: string;
  sparklineData?: number[];
}

export default function MetricCardWithSparkline({
  label,
  value,
  change,
  trend = 'neutral',
  gradientColors,
  icon = '📊',
  sparklineData = [],
}: MetricCardProps) {
  // Transform sparkline data for recharts
  const chartData = sparklineData.map((val, idx) => ({ value: val, index: idx }));

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-white';
    if (trend === 'down') return 'text-red-200';
    return 'text-gray-200';
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
      style={getGradientStyle(gradientColors)}
    >
      {/* Background Icon with opacity */}
      <div className="absolute top-4 right-4 text-6xl opacity-20">
        {icon}
      </div>

      {/* Content */}
      <div className="relative p-6 text-white">
        {/* Label */}
        <div className="text-sm font-medium mb-2 opacity-90">
          {label}
        </div>

        {/* Value */}
        <div className="text-4xl font-bold mb-3">
          {value}
        </div>

        {/* Change & Trend */}
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-medium mb-3 ${getTrendColor()}`}>
            <span className="text-lg">{getTrendIcon()}</span>
            <span>{change}</span>
          </div>
        )}

        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="h-12 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-500 transform -skew-x-12 translate-x-full hover:translate-x-[-200%]" />
    </div>
  );
}
