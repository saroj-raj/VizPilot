'use client';

import { useState } from 'react';

interface DashboardCommandProps {
  onApply: (command: DashboardCommand) => void;
  isLoading?: boolean;
}

export interface DashboardCommand {
  userInstruction: string;
  role: string;
  domain: string;
  intent: string;
  chartType: string;
  timeRange: string;
}

export default function DashboardCommandBox({ onApply, isLoading = false }: DashboardCommandProps) {
  const [instruction, setInstruction] = useState('');
  const [role, setRole] = useState('admin');
  const [domain, setDomain] = useState('finance');
  const [intent, setIntent] = useState('analyze');
  const [chartType, setChartType] = useState('auto');
  const [timeRange, setTimeRange] = useState('30d');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleApply = () => {
    if (!instruction.trim()) {
      alert('Please enter a command or question');
      return;
    }

    onApply({
      userInstruction: instruction,
      role,
      domain,
      intent,
      chartType,
      timeRange,
    });
  };

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' },
    { value: 'finance', label: 'Finance' },
  ];

  const domains = [
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'HR' },
    { value: 'inventory', label: 'Inventory' },
  ];

  const intents = [
    { value: 'analyze', label: 'Analyze' },
    { value: 'compare', label: 'Compare' },
    { value: 'forecast', label: 'Forecast' },
    { value: 'summarize', label: 'Summarize' },
    { value: 'highlight', label: 'Highlight Trends' },
  ];

  const chartTypes = [
    { value: 'auto', label: 'Auto Select' },
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'table', label: 'Table' },
    { value: 'heatmap', label: 'Heatmap' },
  ];

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      {/* Main Command Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tell Vizpilot what to change…
        </label>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., 'Show me revenue trends by region' or 'Create a dashboard for Q4 performance'"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {/* Constraint Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Domain</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            {domains.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Intent</label>
          <select
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            {intents.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            {chartTypes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        <button
          onClick={handleApply}
          disabled={isLoading || !instruction.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Processing...
            </>
          ) : (
            <>
              <span>✨</span>
              Apply
            </>
          )}
        </button>
      </div>

      {/* Advanced Options Info */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700">
          <p className="font-medium mb-2">How Vizpilot Uses Your Preferences:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Role:</strong> Filters data access and available actions based on your position
            </li>
            <li>
              <strong>Domain:</strong> Focuses analysis on relevant business area (finance, sales, etc.)
            </li>
            <li>
              <strong>Intent:</strong> Determines the type of analysis (analyze, compare, forecast, etc.)
            </li>
            <li>
              <strong>Chart Type:</strong> Specifies visualization type or auto-selects optimal format
            </li>
            <li>
              <strong>Time Range:</strong> Sets the historical period for analysis
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
