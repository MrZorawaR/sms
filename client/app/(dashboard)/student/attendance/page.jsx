'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/axios';

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/attendance');
      setAttendance(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
      <p className="text-gray-600">View your detailed attendance records</p>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>All recorded attendance dates</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={2} className="text-center py-8">Loading attendance...</TableCell></TableRow>
              ) : attendance.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center py-8">No attendance records found</TableCell></TableRow>
              ) : (
                attendance.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'Present' ? 'success' : record.status === 'Absent' ? 'destructive' : 'secondary'}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
