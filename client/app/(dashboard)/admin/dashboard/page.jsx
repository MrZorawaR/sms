'use client';

import { useState, useEffect } from 'react';
import StatsCards from '@/components/admin/StatsCards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/axios';

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
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Register New Student</h4>
                <p className="text-sm text-gray-600">Add a new student to the system</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Create New Class</h4>
                <p className="text-sm text-gray-600">Set up a new class for the academic year</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Assign Teachers</h4>
                <p className="text-sm text-gray-600">Assign teachers to classes and subjects</p>
              </div>
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