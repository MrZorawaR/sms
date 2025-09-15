'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, initializeAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
    
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'teacher':
          router.push('/teacher/dashboard');
          break;
        case 'student':
          router.push('/student/dashboard');
          break;
        default:
          router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, router, initializeAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}