"use client";

import React from 'react';

export interface GlobalFilters {
  dateRange: { start: string; end: string } | null;
  clients: string[];
  projectManagers: string[];
  agingBuckets: string[];
  searchQuery: string;
}

interface GlobalFiltersBarProps {
  filters: GlobalFilters;
  onFiltersChange: (filters: GlobalFilters) => void;
  availableClients: string[];
  availableProjectManagers: string[];
  availableAgingBuckets: string[];
}

export default function GlobalFiltersBar({
  filters,
  onFiltersChange,
  availableClients,
  availableProjectManagers,
  availableAgingBuckets,
}: GlobalFiltersBarProps) {
  const updateFilter = (key: keyof GlobalFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClientToggle = (client: string) => {
    const newClients = filters.clients.includes(client)
      ? filters.clients.filter(c => c !== client)
      : [...filters.clients, client];
    updateFilter('clients', newClients);
  };

  const handlePMToggle = (pm: string) => {
    const newPMs = filters.projectManagers.includes(pm)
      ? filters.projectManagers.filter(p => p !== pm)
      : [...filters.projectManagers, pm];
    updateFilter('projectManagers', newPMs);
  };

  const handleAgingToggle = (bucket: string) => {
    const newBuckets = filters.agingBuckets.includes(bucket)
      ? filters.agingBuckets.filter(b => b !== bucket)
      : [...filters.agingBuckets, bucket];
    updateFilter('agingBuckets', newBuckets);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: null,
      clients: [],
      projectManagers: [],
      agingBuckets: [],
      searchQuery: '',
    });
  };

  const hasActiveFilters = 
    filters.dateRange !== null ||
    filters.clients.length > 0 ||
    filters.projectManagers.length > 0 ||
    filters.agingBuckets.length > 0 ||
    filters.searchQuery !== '';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Global Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Search Account/Client
          </label>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Type to search..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => updateFilter('dateRange', { 
                start: e.target.value, 
                end: filters.dateRange?.end || '' 
              })}
              className="w-1/2 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => updateFilter('dateRange', { 
                start: filters.dateRange?.start || '', 
                end: e.target.value 
              })}
              className="w-1/2 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clients */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Clients ({filters.clients.length} selected)
          </label>
          <div className="relative">
            <select
              multiple
              value={filters.clients}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                updateFilter('clients', selected);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 max-h-32 overflow-y-auto"
              size={3}
            >
              {availableClients.map(client => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Aging Buckets */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Aging Buckets
          </label>
          <div className="flex flex-wrap gap-2">
            {availableAgingBuckets.map(bucket => (
              <button
                key={bucket}
                onClick={() => handleAgingToggle(bucket)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filters.agingBuckets.includes(bucket)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bucket}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Managers (if many, show as pills) */}
      {availableProjectManagers.length > 0 && (
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Project Managers ({filters.projectManagers.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableProjectManagers.slice(0, 10).map(pm => (
              <button
                key={pm}
                onClick={() => handlePMToggle(pm)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filters.projectManagers.includes(pm)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pm}
              </button>
            ))}
            {availableProjectManagers.length > 10 && (
              <span className="px-3 py-1 text-xs text-gray-500">
                +{availableProjectManagers.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
