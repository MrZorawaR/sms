'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminTimetable() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    } else {
      setPeriods([]);
    }
  }, [selectedClass, selectedDay]);

  const fetchMetadata = async () => {
    try {
      const [clsRes, subRes, teachRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/subjects'),
        api.get('/admin/teachers')
      ]);
      setClasses(clsRes.data);
      setSubjects(subRes.data);
      setTeachers(teachRes.data);
    } catch (error) {
      toast.error('Failed to load metadata');
    }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/timetable/${selectedClass}`);
      // find the specific day
      const dayData = res.data.find(t => t.dayOfWeek === selectedDay);
      if (dayData && dayData.periods) {
        setPeriods(dayData.periods.map(p => ({
          subjectId: p.subjectId?._id || p.subjectId,
          teacherId: p.teacherId?._id || p.teacherId,
          startTime: p.startTime,
          endTime: p.endTime
        })));
      } else {
        setPeriods([]);
      }
    } catch (error) {
      toast.error('Failed to load timetable for selected class');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = () => {
    setPeriods([...periods, { subjectId: '', teacherId: '', startTime: '', endTime: '' }]);
  };

  const handleRemovePeriod = (index) => {
    const updated = [...periods];
    updated.splice(index, 1);
    setPeriods(updated);
  };

  const handlePeriodChange = (index, field, value) => {
    const updated = [...periods];
    updated[index][field] = value;
    setPeriods(updated);
  };

  const saveTimetable = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }
    
    // Validate empty fields
    const invalid = periods.some(p => !p.subjectId || !p.teacherId || !p.startTime || !p.endTime);
    if (invalid) {
      toast.error('Please fill out all fields for all periods');
      return;
    }

    try {
      setSaving(true);
      await api.post('/admin/timetable', {
        classId: selectedClass,
        dayOfWeek: selectedDay,
        periods
      });
      toast.success(`Timetable saved for ${selectedDay}`);
    } catch (error) {
      toast.error('Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Timetables</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select a Class</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>

              {selectedClass && (
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium">Day of Week</label>
                  <div className="flex flex-col space-y-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`p-2 text-sm text-center rounded-md transition-colors ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{selectedDay} Schedule</CardTitle>
              <CardDescription>
                {selectedClass ? 'Configure the periods for the selected class and day.' : 'Select a class to view its timetable.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedClass ? (
                <div className="flex items-center justify-center p-12 text-gray-500">
                  Please select a class from the sidebar.
                </div>
              ) : loading ? (
                 <div className="space-y-4">
                   <Skeleton className="h-12 w-full" />
                   <Skeleton className="h-12 w-full" />
                 </div>
              ) : (
                <div className="space-y-4">
                  {periods.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      No periods scheduled for {selectedDay}.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {periods.map((period, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg bg-gray-50 items-end">
                          <div className="w-full sm:w-1/4 space-y-1">
                            <label className="text-xs font-medium">Subject</label>
                            <select 
                              className="w-full p-2 text-sm border rounded-md"
                              value={period.subjectId}
                              onChange={(e) => handlePeriodChange(index, 'subjectId', e.target.value)}
                            >
                              <option value="">Select Subject</option>
                              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                          </div>
                          
                          <div className="w-full sm:w-1/4 space-y-1">
                            <label className="text-xs font-medium">Teacher</label>
                            <select 
                              className="w-full p-2 text-sm border rounded-md"
                              value={period.teacherId}
                              onChange={(e) => handlePeriodChange(index, 'teacherId', e.target.value)}
                            >
                              <option value="">Select Teacher</option>
                              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                          </div>
                          
                          <div className="w-full sm:w-1/6 space-y-1">
                            <label className="text-xs font-medium">Start</label>
                            <input 
                              type="time" 
                              className="w-full p-2 text-sm border rounded-md"
                              value={period.startTime}
                              onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                            />
                          </div>

                          <div className="w-full sm:w-1/6 space-y-1">
                            <label className="text-xs font-medium">End</label>
                            <input 
                              type="time" 
                              className="w-full p-2 text-sm border rounded-md"
                              value={period.endTime}
                              onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                            />
                          </div>
                          
                          <div className="pb-1">
                            <Button variant="destructive" size="icon" onClick={() => handleRemovePeriod(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 pt-4">
                    <Button variant="outline" onClick={handleAddPeriod}>
                      <Plus className="h-4 w-4 mr-2" /> Add Period
                    </Button>
                    <Button onClick={saveTimetable} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                      {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save Day Schedule</>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
