'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, BookOpen, Settings, Calendar } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: GraduationCap },
  { name: 'Teachers', href: '/admin/teachers', icon: Users },
  { name: 'Classes', href: '/admin/classes', icon: BookOpen },
  { name: 'Subjects', href: '/admin/subjects', icon: Settings },
  { name: 'Timetable', href: '/admin/timetable', icon: Calendar },
];

export default function AdminLayout({ children }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header title="Admin Dashboard" navigation={navigation} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navigation={navigation} />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}