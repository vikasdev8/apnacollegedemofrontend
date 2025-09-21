'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import { useLogoutMutation, useGetProfileQuery } from '@/lib/redux/api/authApi';
import { clearUser, setUser } from '@/lib/redux/slices/globalSlice';
import DSASheet from './components/DSASheet';

export default function Dashboard() {
  const { user, isAuthenticated } = useAppSelector(state => state.globalState);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

  useEffect(() => {
    if (!isAuthenticated && !profileLoading) {
      router.push('/');
    } else if (profileData?.user && !user) {
      dispatch(setUser(profileData.user));
    }
  }, [isAuthenticated, profileLoading, profileData, user, dispatch, router]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearUser());
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user && !profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to access the dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DSA Learning Platform</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.firstName}! Track your progress.</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${
                logoutLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - DSA Sheet */}
      <main className="py-6">
        <DSASheet />
      </main>
    </div>
  );
}