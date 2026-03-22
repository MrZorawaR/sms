'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useAttendanceStore from '@/store/attendanceStore';
import api from '@/lib/axios';

export default function TeacherAttendance() {
  const { students, fetchClassStudents, markAttendance, loading, error: storeError } = useAttendanceStore();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch assigned classes
    api.get('/teacher/classes').then(res => setClasses(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass).then(studentList => {
        // Initialize all as Present
        const initial = {};
        studentList.forEach(s => initial[s._id] = 'Present');
        setAttendanceData(initial);
        setMessage('');
      });
    }
  }, [selectedClass, fetchClassStudents]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass) return;
    const attendanceDataArray = Object.keys(attendanceData).map(studentId => ({
      studentId: studentId,
      status: attendanceData[studentId]
    }));
    const res = await markAttendance({ classId: selectedClass, date, attendanceData: attendanceDataArray });
    if (res.success) {
      setMessage('Attendance submitted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
      
      {storeError && <Alert variant="destructive"><AlertDescription>{storeError}</AlertDescription></Alert>}
      {message && <Alert className="bg-green-50 text-green-700 border-green-200"><AlertDescription>{message}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Select Class & Date</CardTitle>
          <CardDescription>Choose the class to mark attendance for today or a specific date.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select onValueChange={setSelectedClass} value={selectedClass}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input 
            type="date" 
            className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </CardContent>
      </Card>

      {selectedClass && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s._id}>
                    <TableCell>{s.rollNumber}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      <Select value={attendanceData[s._id]} onValueChange={(val) => handleStatusChange(s._id, val)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Present">Present</SelectItem>
                          <SelectItem value="Absent">Absent</SelectItem>
                          <SelectItem value="Late">Late</SelectItem>
                          <SelectItem value="Half Day">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Attendance'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClass && students.length === 0 && !loading && (
        <Alert><AlertDescription>No students found in this class.</AlertDescription></Alert>
      )}
    </div>
  );
}
