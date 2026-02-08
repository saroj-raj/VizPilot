'use client';
import { VegaLite } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';

interface ChartData {
  month: string;
  revenue?: number;
  expenses?: number;
  profit?: number;
  category?: string;
  value?: number;
}

interface ChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'area' | 'pie';
  title?: string;
  height?: number;
  width?: number;
}

export default function Chart({ data, type, title, height = 300, width = 500 }: ChartProps) {
  const getSpec = (): VisualizationSpec => {
    const baseSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      title: title || 'Chart',
      width: width,
      height: height,
      data: { values: data },
      config: {
        axis: {
          labelFont: 'Inter, sans-serif',
          titleFont: 'Inter, sans-serif',
        },
        legend: {
          labelFont: 'Inter, sans-serif',
          titleFont: 'Inter, sans-serif',
        },
        title: {
          font: 'Inter, sans-serif',
          fontSize: 16,
          fontWeight: 600,
        },
      },
    };

    switch (type) {
      case 'line':
        return {
          ...baseSpec,
          layer: [
            {
              mark: { type: 'line', point: true, strokeWidth: 2 },
              encoding: {
                x: { field: 'month', type: 'ordinal', title: 'Month' },
                y: { field: 'revenue', type: 'quantitative', title: 'Revenue ($k)' },
                color: { value: '#3b82f6' },
              },
            },
            {
              mark: { type: 'line', point: true, strokeWidth: 2 },
              encoding: {
                x: { field: 'month', type: 'ordinal' },
                y: { field: 'expenses', type: 'quantitative' },
                color: { value: '#ef4444' },
              },
            },
            {
              mark: { type: 'line', point: true, strokeWidth: 2 },
              encoding: {
                x: { field: 'month', type: 'ordinal' },
                y: { field: 'profit', type: 'quantitative' },
                color: { value: '#10b981' },
              },
            },
          ],
        } as VisualizationSpec;

      case 'bar':
        return {
          ...baseSpec,
          mark: { type: 'bar', cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
          encoding: {
            x: { field: 'month', type: 'ordinal', title: 'Month' },
            y: { field: 'revenue', type: 'quantitative', title: 'Revenue ($k)' },
            color: {
              field: 'revenue',
              type: 'quantitative',
              scale: { scheme: 'blues' },
              legend: null,
            },
            tooltip: [
              { field: 'month', type: 'ordinal', title: 'Month' },
              { field: 'revenue', type: 'quantitative', title: 'Revenue', format: '$,.0f' },
            ],
          },
        } as VisualizationSpec;

      case 'area':
        return {
          ...baseSpec,
          layer: [
            {
              mark: { type: 'area', opacity: 0.7 },
              encoding: {
                x: { field: 'month', type: 'ordinal', title: 'Month' },
                y: { field: 'revenue', type: 'quantitative', title: 'Amount ($k)' },
                color: { value: '#3b82f6' },
              },
            },
            {
              mark: { type: 'area', opacity: 0.5 },
              encoding: {
                x: { field: 'month', type: 'ordinal' },
                y: { field: 'expenses', type: 'quantitative' },
                color: { value: '#ef4444' },
              },
            },
          ],
        } as VisualizationSpec;

      case 'pie':
        return {
          ...baseSpec,
          mark: { type: 'arc', innerRadius: 50 },
          encoding: {
            theta: { field: 'value', type: 'quantitative' },
            color: {
              field: 'category',
              type: 'nominal',
              scale: { scheme: 'category10' },
              legend: { title: 'Category' },
            },
            tooltip: [
              { field: 'category', type: 'nominal', title: 'Category' },
              { field: 'value', type: 'quantitative', title: 'Value', format: ',.0f' },
            ],
          },
        } as VisualizationSpec;

      default:
        return baseSpec as VisualizationSpec;
    }
  };

  return (
    <div className="chart-container">
      <VegaLite spec={getSpec()} actions={false} />
    </div>
  );
}

// Revenue Trend Chart Component
export function RevenueTrendChart({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-white rounded-lg p-4">
      <Chart
        data={data}
        type="line"
        title="Revenue, Expenses & Profit Trends"
        width={600}
        height={300}
      />
      <div className="flex justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Revenue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Expenses</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Profit</span>
        </div>
      </div>
    </div>
  );
}

// Monthly Revenue Bar Chart
export function MonthlyRevenueChart({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-white rounded-lg p-4">
      <Chart
        data={data}
        type="bar"
        title="Monthly Revenue"
        width={600}
        height={250}
      />
    </div>
  );
}

// Expense Distribution Pie Chart
export function ExpenseDistributionChart({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-white rounded-lg p-4">
      <Chart
        data={data}
        type="pie"
        title="Expense Distribution"
        width={400}
        height={300}
      />
    </div>
  );
}
