"use client";

import React from 'react';

export interface RedFlag {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  count?: number;
  action?: () => void;
}

interface RedFlagsStripProps {
  flags: RedFlag[];
  onDismiss?: (flagId: string) => void;
}

export default function RedFlagsStrip({ flags, onDismiss }: RedFlagsStripProps) {
  if (flags.length === 0) return null;

  const getSeverityStyles = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          text: 'text-red-900',
          badge: 'bg-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: 'text-amber-600',
          text: 'text-amber-900',
          badge: 'bg-amber-600',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-900',
          badge: 'bg-blue-600',
        };
    }
  };

  const getIcon = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="mb-6 space-y-2">
      {flags.map((flag) => {
        const styles = getSeverityStyles(flag.severity);
        return (
          <div
            key={flag.id}
            className={`${styles.bg} border rounded-lg p-3 flex items-center justify-between gap-4`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={styles.icon}>
                {getIcon(flag.severity)}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${styles.text}`}>
                  {flag.message}
                  {flag.count !== undefined && (
                    <span className={`ml-2 px-2 py-0.5 ${styles.badge} text-white text-xs font-bold rounded-full`}>
                      {flag.count}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {flag.action && (
                <button
                  onClick={flag.action}
                  className={`text-xs font-medium ${styles.text} hover:underline`}
                >
                  View Details →
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={() => onDismiss(flag.id)}
                  className={`${styles.icon} hover:opacity-70 transition-opacity`}
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
