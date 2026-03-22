'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/axios';

export default function StudentMarksPage() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/marks');
      setMarks(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Marks</h1>
      <p className="text-gray-600">View your academic performance by subject</p>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Academic Results</CardTitle>
          <CardDescription>Recently recorded marks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading marks...</TableCell></TableRow>
              ) : Object.keys(marks).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No marks records found</TableCell></TableRow>
              ) : (
                Object.entries(marks).flatMap(([subjectName, subjectMarks]) => 
                  subjectMarks.map(mark => ({ ...mark, subjectName }))
                ).sort((a,b) => new Date(b.date) - new Date(a.date)).map((mark, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{new Date(mark.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{mark.subjectName}</TableCell>
                      <TableCell>{mark.examType}</TableCell>
                      <TableCell>{mark.score}</TableCell>
                      <TableCell>{mark.totalMarks}</TableCell>
                      <TableCell>{mark.percentage}%</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
