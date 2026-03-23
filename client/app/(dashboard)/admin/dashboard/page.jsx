'use client';

import { useState, useEffect } from 'react';
import StatsCards from '@/components/admin/StatsCards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import api from '@/lib/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch statistics');
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-10 w-[80px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const userStats = [
    { name: 'Students', count: stats?.totalStudents || 0 },
    { name: 'Teachers', count: stats?.totalTeachers || 0 },
    { name: 'Classes', count: stats?.totalClasses || 0 },
  ];

  const parsedAttendance = parseFloat(stats?.attendanceRate || "0");
  const pieData = [
    { name: 'Present', value: parsedAttendance },
    { name: 'Absent', value: 100 - parsedAttendance },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <StatsCards stats={stats} />

      {/* CHARTS SECTION */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Demographics</CardTitle>
            <CardDescription>Accounts vs Entities</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global Attendance Rate</CardTitle>
            <CardDescription>Platform-wide recorded present vs absent ratios</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <Link href="/admin/students" className="p-3 border rounded-lg hover:bg-gray-50 transition-colors block">
                <h4 className="font-medium">Register New Student</h4>
                <p className="text-sm text-gray-600">Add a new student to the system</p>
              </Link>
              <Link href="/admin/classes" className="p-3 border rounded-lg hover:bg-gray-50 transition-colors block">
                <h4 className="font-medium">Create New Class</h4>
                <p className="text-sm text-gray-600">Set up a new class for the academic year</p>
              </Link>
              <Link href="/admin/classes" className="p-3 border rounded-lg hover:bg-gray-50 transition-colors block">
                <h4 className="font-medium">Assign Teachers</h4>
                <p className="text-sm text-gray-600">Assign teachers to classes and subjects</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-medium">{(stats?.totalStudents || 0) + (stats?.totalTeachers || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Load</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Normal
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}