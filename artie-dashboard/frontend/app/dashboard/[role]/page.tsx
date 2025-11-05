'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RoleDashboard() {
  const router = useRouter();
  const params = useParams();
  const role = params?.role as string;

  useEffect(() => {
    // Redirect admin to manager dashboard (or we can create a separate admin page)
    if (role === 'admin') {
      router.replace('/dashboard/manager');
    } else if (role && !['employee', 'finance', 'manager'].includes(role)) {
      // Unknown role, redirect to login
      router.replace('/login');
    }
  }, [role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
