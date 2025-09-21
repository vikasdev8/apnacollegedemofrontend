'use client';

import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAppSelector } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import { useGetAuthStatusQuery } from '@/lib/redux/api/authApi';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAppSelector(state => state.globalState);
  const router = useRouter();
  
  // Check authentication status on load
  const { data: authStatus } = useGetAuthStatusQuery();

  useEffect(() => {
    if (authStatus?.isAuthenticated || isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authStatus, isAuthenticated, router]);

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Apna College Demo
          </h1>
          <p className="text-gray-600 text-sm">
            Professional Authentication System
          </p>
        </div>
        
        {isLogin ? (
          <LoginForm onSwitchToRegister={switchToRegister} />
        ) : (
          <RegisterForm onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
}
