'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardList, BookOpen, Calendar } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';

const navigation = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { name: 'My Classes', href: '/teacher/classes', icon: Users },
  { name: 'Attendance', href: '/teacher/attendance', icon: ClipboardList },
  { name: 'Marks', href: '/teacher/marks', icon: BookOpen },
  { name: 'Timetable', href: '/teacher/timetable', icon: Calendar },
];

export default function TeacherLayout({ children }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'teacher') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header title="Teacher Dashboard" navigation={navigation} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navigation={navigation} />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}