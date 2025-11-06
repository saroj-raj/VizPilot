"use client";

import React from 'react';
import { formatCurrency, formatPercentage, calculateChange } from '@/lib/utils/formatting';

export interface KPIData {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  unit: 'currency' | 'percentage' | 'number' | 'days';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

interface KPITilesProps {
  kpis: KPIData[];
  loading?: boolean;
}

export default function KPITiles({ kpis, loading }: KPITilesProps) {
  const formatValue = (value: number, unit: KPIData['unit']) => {
    switch (unit) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'days':
        return `${Math.round(value)} days`;
      case 'number':
        return value.toLocaleString('en-US');
      default:
        return value.toString();
    }
  };

  const getChangeInfo = (kpi: KPIData) => {
    if (kpi.previousValue === undefined) return null;
    return calculateChange(kpi.value, kpi.previousValue);
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    if (direction === 'down') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral', isGood: boolean = true) => {
    if (direction === 'neutral') return 'text-gray-500';
    // For AR metrics, 'up' is usually bad (more outstanding), 'down' is good
    // But this can be customized per KPI
    if (direction === 'up') return isGood ? 'text-green-600' : 'text-red-600';
    return isGood ? 'text-red-600' : 'text-green-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => {
        const change = getChangeInfo(kpi);
        const trendDirection = change?.direction || kpi.trend || 'neutral';
        
        return (
          <div
            key={kpi.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {kpi.title}
                </h3>
                {kpi.description && (
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {kpi.description}
                  </p>
                )}
              </div>
              {kpi.icon && (
                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  {kpi.icon}
                </div>
              )}
            </div>

            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">
                {formatValue(kpi.value, kpi.unit)}
              </div>
            </div>

            {change && (
              <div className="flex items-center gap-1">
                <span className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(trendDirection)}`}>
                  {getTrendIcon(trendDirection)}
                  {change.formatted}
                </span>
                <span className="text-xs text-gray-500">
                  vs previous period
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
