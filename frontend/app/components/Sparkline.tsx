"use client";

import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDots?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export default function Sparkline({
  data,
  width = 80,
  height = 24,
  color,
  fillColor,
  strokeWidth = 1.5,
  showDots = false,
  trend
}: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div 
        style={{ width, height }} 
        className="flex items-center justify-center text-gray-400 text-xs"
      >
        —
      </div>
    );
  }

  // Auto-detect trend if not provided
  const detectedTrend = trend || (() => {
    const first = data[0];
    const last = data[data.length - 1];
    const change = ((last - first) / first) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'neutral';
  })();

  // Auto color based on trend (lower AR is better, so down is green)
  const trendColor = color || (() => {
    if (detectedTrend === 'down') return '#10b981'; // green (good - decreasing AR)
    if (detectedTrend === 'up') return '#ef4444';   // red (bad - increasing AR)
    return '#6b7280';                                // gray (neutral)
  })();

  const trendFillColor = fillColor || (() => {
    if (detectedTrend === 'down') return 'rgba(16, 185, 129, 0.1)'; // green with opacity
    if (detectedTrend === 'up') return 'rgba(239, 68, 68, 0.1)';    // red with opacity
    return 'rgba(107, 114, 128, 0.1)';                              // gray with opacity
  })();

  // Calculate min and max for scaling
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const valueRange = maxValue - minValue || 1;

  // Add padding to prevent clipping
  const padding = 2;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  // Calculate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Create fill area path (line + bottom closure)
  const fillPath = `
    M ${padding},${height - padding}
    L ${points.split(' ')[0]}
    L ${points}
    L ${width - padding},${height - padding}
    Z
  `.trim();

  return (
    <div 
      className="inline-flex items-center gap-1.5" 
      title={`Trend: ${data.length} data points | ${detectedTrend === 'down' ? '↓ Improving' : detectedTrend === 'up' ? '↑ Worsening' : '→ Stable'}`}
    >
      <svg 
        width={width} 
        height={height} 
        className="overflow-visible"
        style={{ display: 'block' }}
      >
        {/* Fill area under line */}
        <path
          d={fillPath}
          fill={trendFillColor}
          strokeWidth={0}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={trendColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Optional dots at data points */}
        {showDots && data.map((value, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={1.5}
              fill={trendColor}
            />
          );
        })}
      </svg>
      
      {/* Trend indicator icon */}
      <span className="text-xs" style={{ color: trendColor }}>
        {detectedTrend === 'down' ? '↓' : detectedTrend === 'up' ? '↑' : '→'}
      </span>
    </div>
  );
}

// Optional: Pre-styled variants for common use cases
export function BalanceSparkline({ data }: { data: number[] }) {
  return <Sparkline data={data} width={80} height={24} />;
}

export function DSOSparkline({ data }: { data: number[] }) {
  // For DSO, lower is better, so flip the color logic
  const first = data[0];
  const last = data[data.length - 1];
  const isImproving = last < first;
  
  return (
    <Sparkline 
      data={data} 
      width={80} 
      height={24}
      color={isImproving ? '#10b981' : '#ef4444'}
      fillColor={isImproving ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
    />
  );
}

export function ActivitySparkline({ data }: { data: number[] }) {
  // Activity sparkline with blue color
  return (
    <Sparkline 
      data={data} 
      width={80} 
      height={24}
      color="#3b82f6"
      fillColor="rgba(59, 130, 246, 0.1)"
    />
  );
}
