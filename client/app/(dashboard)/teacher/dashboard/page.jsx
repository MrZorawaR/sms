'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, BookOpen, ClipboardList, Calendar } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/classes');
      setClasses(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch classes');
      console.error('Fetch classes error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
  const totalSubjects = classes.reduce((sum, cls) => sum + (cls.subjects?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
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
              Total Classes
            </CardTitle>
            <div className="rounded-lg bg-blue-50 p-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Students
            </CardTitle>
            <div className="rounded-lg bg-green-50 p-2">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
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
              Today's Date
            </CardTitle>
            <div className="rounded-lg bg-orange-50 p-2">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Classes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>
              Classes assigned to you for this academic year
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No classes assigned yet
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div key={cls._id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{cls.name}</h4>
                        <p className="text-sm text-gray-600">
                          {cls.students?.length || 0} students
                        </p>
                      </div>
                      <Badge variant="outline">
                        Section {cls.section || 'A'}
                      </Badge>
                    </div>
                    {cls.subjects?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cls.subjects.map((subject) => (
                          <Badge key={subject._id} variant="secondary" className="text-xs">
                            {subject.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for teachers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2">
              <Link href="/teacher/attendance" className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer block">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Take Attendance</h4>
                    <p className="text-sm text-gray-600">Mark student attendance for today</p>
                  </div>
                </div>
              </Link>
              <Link href="/teacher/marks" className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer block">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-green-50 p-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Enter Marks</h4>
                    <p className="text-sm text-gray-600">Record student marks and grades</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}