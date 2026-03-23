'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import api from '@/lib/axios';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentTimetable() {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/student/timetable');
      // res.data is an array of Timetable documents for this student's class
      const daysMap = {};
      DAYS_OF_WEEK.forEach(day => daysMap[day] = []);

      res.data.forEach(timetableDoc => {
        const day = timetableDoc.dayOfWeek;
        // Sort periods by startTime
        const sortedPeriods = [...timetableDoc.periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        daysMap[day] = sortedPeriods.map(p => ({
          subject: p.subjectId?.name || 'Unknown Subject',
          teacher: p.teacherId?.name || 'Unknown Teacher',
          startTime: p.startTime,
          endTime: p.endTime
        }));
      });

      setSchedule(daysMap);
    } catch (err) {
      setError('Failed to load class timetable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Class Timetable</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {DAYS_OF_WEEK.map(day => {
          const periods = schedule[day] || [];

          return (
            <Card key={day} className={`h-full ${periods.length === 0 ? 'opacity-60' : ''}`}>
              <CardHeader className="bg-gray-50 border-b pb-4">
                <CardTitle className="text-xl">{day}</CardTitle>
                <CardDescription>
                  {periods.length > 0 ? `${periods.length} Periods scheduled` : 'No classes scheduled'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {periods.length > 0 ? (
                  <div className="divide-y">
                    {periods.map((p, idx) => (
                      <div key={idx} className="p-4 flex flex-col space-y-1 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-blue-800">{p.subject}</span>
                          <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {p.startTime} - {p.endTime}
                          </span>
                        </div>
                        <span className="text-gray-500 text-sm">Instructor: {p.teacher}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-400">
                    Day Off
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
