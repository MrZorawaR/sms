'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, User, ClipboardList, BookOpen, FileText, Calendar } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import Header from '@/components/shared/Header';
import Sidebar from '@/components/shared/Sidebar';

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/student/profile', icon: User },
  { name: 'Attendance', href: '/student/attendance', icon: ClipboardList },
  { name: 'Marks', href: '/student/marks', icon: BookOpen },
  { name: 'Report Card', href: '/student/report', icon: FileText },
  { name: 'Timetable', href: '/student/timetable', icon: Calendar },
];

export default function StudentLayout({ children }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'student') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header title="Student Portal" navigation={navigation} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navigation={navigation} />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}