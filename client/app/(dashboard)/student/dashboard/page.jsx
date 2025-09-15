'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { User, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import api from '@/lib/axios';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, attendanceRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/attendance/summary')
      ]);
      
      setProfile(profileRes.data);
      setAttendanceSummary(attendanceRes.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Fetch dashboard data error:', error);
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

  const totalSubjects = Object.keys(attendanceSummary || {}).length;
  const overallAttendance = Object.values(attendanceSummary || {}).reduce((sum, subject) => 
    sum + parseFloat(subject.percentage || 0), 0) / (totalSubjects || 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-gray-600">Here's an overview of your academic progress</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Student ID
            </CardTitle>
            <div className="rounded-lg bg-blue-50 p-2">
              <User className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.rollNumber || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Class
            </CardTitle>
            <div className="rounded-lg bg-green-50 p-2">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.class ? `${profile.class.name}` : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Subjects
            </CardTitle>
            <div className="rounded-lg bg-purple-50 p-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Attendance
            </CardTitle>
            <div className="rounded-lg bg-orange-50 p-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendance.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>
              Your personal and academic details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-blue-100 p-3">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{profile.name}</h3>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Roll Number</p>
                    <p className="font-medium">{profile.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="font-medium">
                      {profile.class ? `${profile.class.name} - Section ${profile.class.section}` : 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Academic Year</p>
                    <p className="font-medium">{profile.class?.academicYear || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No profile information available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>
              Your attendance summary by subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceSummary && Object.keys(attendanceSummary).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(attendanceSummary).map(([subject, data]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{subject}</span>
                      <span className="text-gray-600">{data.percentage}%</span>
                    </div>
                    <Progress 
                      value={parseFloat(data.percentage)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Present: {data.present}</span>
                      <span>Total: {data.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}