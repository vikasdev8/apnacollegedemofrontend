"use client";

import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAppSelector } from '@/lib/redux/store';
import { useGetProfileQuery } from '@/lib/redux/api/authApi';

interface RouteGuardProps {
  children: ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

export default function RouteGuard({ 
  children, 
  requiresAuth = false, 
  requiresAdmin = false 
}: RouteGuardProps) {
  const { user, isAuthenticated } = useAppSelector(state => state.globalState);
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Always try to fetch profile when component loads to validate session
    // The result is cached by RTK Query
  }, []);

  useEffect(() => {
    // After profile data is loaded, check authorization
    if (profileLoading) return;

    const isAdmin = user?.role === 'admin';
    
    if (requiresAuth && !isAuthenticated && !profileData) {
      // Redirect to login page if auth required but not authenticated
      router.push(`/?redirect=${encodeURIComponent(pathname)}`);
    } else if (requiresAdmin && !isAdmin) {
      // Redirect to dashboard if admin required but not admin
      router.push('/dashboard');
    }
  }, [isAuthenticated, profileData, profileLoading, requiresAdmin, requiresAuth, router, user, pathname]);

  // Show loading when checking authentication
  if (profileLoading && (requiresAuth || requiresAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show unauthorized message if trying to access admin area without permission
  if (requiresAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="mb-4">You don&apos;t have permission to access this area.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not authenticated but auth required
  if (requiresAuth && !isAuthenticated && !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="mb-4">Please login to continue.</p>
          <button 
            onClick={() => router.push(`/?redirect=${encodeURIComponent(pathname)}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If authorized or no auth required, render children
  return <>{children}</>;
}