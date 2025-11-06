// Role-specific configuration and permissions

export type Role = 'admin' | 'manager' | 'employee' | 'finance';

export interface RoleConfig {
  name: string;
  icon: string;
  color: string;
  permissions: {
    canViewAllData: boolean;
    canManageTeam: boolean;
    canUploadFiles: boolean;
    canViewFinancials: boolean;
    canEditSettings: boolean;
  };
  allowedWidgets: string[];
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  admin: {
    name: 'Administrator',
    icon: '👑',
    color: 'purple',
    permissions: {
      canViewAllData: true,
      canManageTeam: true,
      canUploadFiles: true,
      canViewFinancials: true,
      canEditSettings: true,
    },
    allowedWidgets: ['bar_chart', 'line_chart', 'pie_chart', 'kpi', 'table'],
  },
  manager: {
    name: 'Manager',
    icon: '📊',
    color: 'blue',
    permissions: {
      canViewAllData: true,
      canManageTeam: true,
      canUploadFiles: true,
      canViewFinancials: true,
      canEditSettings: false,
    },
    allowedWidgets: ['bar_chart', 'line_chart', 'kpi', 'table'],
  },
  employee: {
    name: 'Employee',
    icon: '👤',
    color: 'green',
    permissions: {
      canViewAllData: false,
      canManageTeam: false,
      canUploadFiles: true,
      canViewFinancials: false,
      canEditSettings: false,
    },
    allowedWidgets: ['kpi', 'bar_chart'],
  },
  finance: {
    name: 'Finance',
    icon: '💰',
    color: 'orange',
    permissions: {
      canViewAllData: true,
      canManageTeam: false,
      canUploadFiles: true,
      canViewFinancials: true,
      canEditSettings: false,
    },
    allowedWidgets: ['bar_chart', 'line_chart', 'pie_chart', 'kpi', 'table'],
  },
};

// Filter widgets based on role permissions
export function filterWidgetsByRole(widgets: any[], role: Role): any[] {
  const config = ROLE_CONFIGS[role];
  return widgets.filter(widget => config.allowedWidgets.includes(widget.type));
}

// Filter data based on role (e.g., employee only sees their own data)
export function filterDataByRole(data: any[], role: Role, userId?: string): any[] {
  const config = ROLE_CONFIGS[role];
  
  if (config.permissions.canViewAllData) {
    return data;
  }
  
  // Employee: filter to only their assigned data
  if (role === 'employee' && userId) {
    // In production, filter by assigned_to, owner_id, etc.
    // For now, return limited sample
    return data.slice(0, Math.floor(data.length / 3));
  }
  
  return data;
}

// Get role-specific dashboard title
export function getRoleDashboardTitle(role: Role): string {
  return `${ROLE_CONFIGS[role].icon} ${ROLE_CONFIGS[role].name} Dashboard`;
}

// Get user display name from role
export function getRoleDisplayName(role: Role, businessName?: string): string {
  const config = ROLE_CONFIGS[role];
  return `${config.name} - ${businessName || 'My Business'}`;
}
