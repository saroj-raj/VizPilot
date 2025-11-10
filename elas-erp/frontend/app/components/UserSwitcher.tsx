'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'finance';
  business: string;
  avatar?: string;
}

// Get role from URL or localStorage
const getCurrentRole = (pathname: string): 'admin' | 'manager' | 'employee' | 'finance' => {
  if (pathname.includes('/dashboard/')) {
    const parts = pathname.split('/');
    const role = parts[parts.indexOf('dashboard') + 1];
    if (role && ['admin', 'manager', 'employee', 'finance'].includes(role)) {
      return role as 'admin' | 'manager' | 'employee' | 'finance';
    }
  }
  return 'admin';
};

// Role configurations with actual business context
const getRoleUser = (role: string, businessName?: string): User => {
  const business = businessName || (typeof window !== 'undefined' ? localStorage.getItem('businessName') : null) || 'My Business';
  const email = (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null) || 'user@example.com';
  
  const roleConfigs = {
    admin: { name: 'Admin User', email },
    manager: { name: 'Manager User', email },
    employee: { name: 'Employee User', email },
    finance: { name: 'Finance User', email },
  };
  
  const config = roleConfigs[role as keyof typeof roleConfigs] || roleConfigs.admin;
  
  return {
    id: role,
    name: config.name,
    email: config.email,
    role: role as 'admin' | 'manager' | 'employee' | 'finance',
    business,
  };
};

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  manager: 'bg-blue-100 text-blue-700 border-blue-200',
  employee: 'bg-green-100 text-green-700 border-green-200',
  finance: 'bg-orange-100 text-orange-700 border-orange-200',
};

const ROLE_ICONS = {
  admin: '👑',
  manager: '📊',
  employee: '👤',
  finance: '💰',
};

export default function UserSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get current role from URL
  const currentRole = getCurrentRole(pathname);
  const businessName = typeof window !== 'undefined' 
    ? localStorage.getItem('businessName') || 'My Business'
    : 'My Business';
  
  const [currentUser, setCurrentUser] = useState<User>(() => getRoleUser(currentRole, businessName));
  
  // Update current user when pathname changes
  useEffect(() => {
    const newRole = getCurrentRole(pathname);
    setCurrentUser(getRoleUser(newRole, businessName));
  }, [pathname, businessName]);
  
  // Available roles for switching
  const availableRoles: User[] = [
    getRoleUser('admin', businessName),
    getRoleUser('manager', businessName),
    getRoleUser('employee', businessName),
    getRoleUser('finance', businessName),
  ];
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitchUser = (user: User) => {
    console.log('🔄 Attempting to switch to:', user.role);
    setCurrentUser(user);
    setIsOpen(false);
    
    // Navigate to the appropriate dashboard
    const targetPath = `/dashboard/${user.role}`;
    console.log('📍 Target path:', targetPath);
    
    // Use window.location for reliable navigation
    window.location.href = targetPath;
    
    // In production, you would also:
    // 1. Update auth context
    // 2. Update localStorage/sessionStorage
    // 3. Fetch new user-specific data
    console.log('🔄 Switched to:', user);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
          ROLE_COLORS[currentUser.role]
        }`}>
          {ROLE_ICONS[currentUser.role]}
        </div>
        
        {/* User Info */}
        <div className="text-left hidden sm:block">
          <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
          <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
        </div>
        
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Current User Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {ROLE_ICONS[currentUser.role]}
              </div>
              <div>
                <div className="font-semibold">{currentUser.name}</div>
                <div className="text-xs opacity-90">{currentUser.email}</div>
                <div className="text-xs opacity-75 mt-1">🏢 {currentUser.business}</div>
              </div>
            </div>
          </div>

          {/* Switch Role Section */}
          <div className="p-3 border-b border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Switch Role
            </div>
            <div className="space-y-1">
              {availableRoles.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSwitchUser(user)}
                  disabled={user.id === currentUser.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    user.id === currentUser.id
                      ? 'bg-blue-50 border border-blue-200 cursor-default'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {/* Role Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    ROLE_COLORS[user.role]
                  } border`}>
                    {ROLE_ICONS[user.role]}
                  </div>
                  
                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                  
                  {/* Active Indicator */}
                  {user.id === currentUser.id && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 bg-gray-50">
            <button
              onClick={() => {
                router.push('/onboarding/business');
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors text-left flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
