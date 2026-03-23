'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import api from '@/lib/axios';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherTimetable() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/teacher/timetable');
      // Grouping logic: the backend returns all documents where the teacher has at least one period.
      // E.g. [ { dayOfWeek: 'Monday', classId: {name: '10'}, periods: [...] } ]
      // We should flatten and group by Day
      const daysMap = {};
      DAYS_OF_WEEK.forEach(day => daysMap[day] = []);

      res.data.forEach(timetableDoc => {
        const day = timetableDoc.dayOfWeek;
        const cls = timetableDoc.classId;
        timetableDoc.periods.forEach(p => {
          // If this period belongs to the teacher, we add it to the rendering list
          // Wait, the backend doesn't filter the inner array. We must filter it locally.
          // Teacher's _id would be p.teacherId._id.
          daysMap[day].push({
            className: `${cls.name} - ${cls.section}`,
            subject: p.subjectId?.name || 'Unknown',
            startTime: p.startTime,
            endTime: p.endTime
          });
        });
      });

      // Sort periods by startTime
      DAYS_OF_WEEK.forEach(day => {
        daysMap[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      setSchedule(daysMap);
    } catch (err) {
      setError('Failed to load your timetable');
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
        <h1 className="text-3xl font-bold tracking-tight">My Timetable</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DAYS_OF_WEEK.map(day => {
          const periods = schedule[day] || [];
          if (periods.length === 0) return null; // Only show days with classes

          return (
            <Card key={day} className="h-full">
              <CardHeader className="bg-gray-50 border-b pb-4">
                <CardTitle className="text-xl">{day}</CardTitle>
                <CardDescription>{periods.length} Classes scheduled</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {periods.map((p, idx) => (
                    <div key={idx} className="p-4 flex flex-col space-y-1 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-blue-700">{p.className}</span>
                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {p.startTime} - {p.endTime}
                        </span>
                      </div>
                      <span className="text-gray-600 text-sm">{p.subject}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.values(schedule).flat().length === 0 && (
         <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
           You have no classes scheduled. Enjoy your free time!
         </div>
      )}
    </div>
  );
}
