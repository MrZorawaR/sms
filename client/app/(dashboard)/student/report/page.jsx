'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, GraduationCap, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/axios';

export default function ReportCard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/report');
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report card');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">Report Card</h1>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto print:shadow-none print:border-none print:w-full">
        <CardHeader className="text-center border-b pb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-4 inline-flex">
              <GraduationCap className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl mb-2">Academic Report Card</CardTitle>
          <CardDescription className="text-lg">
            {report?.studentDetails?.academicYear || 'Current Year'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-8">
          {/* Student Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-lg text-sm">
            <div>
              <p className="text-gray-500 font-medium mb-1">Student Name</p>
              <p className="font-semibold text-base">{report?.studentDetails?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Roll Number</p>
              <p className="font-semibold text-base">{report?.studentDetails?.rollNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Class</p>
              <p className="font-semibold text-base">{report?.studentDetails?.className}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Status</p>
              <p className="font-semibold text-base text-green-600">Active</p>
            </div>
          </div>

          {/* Subjects Table */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Subject performance</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Max Marks</TableHead>
                    <TableHead className="text-right">Obtained</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report?.subjects?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No subject marks available yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    report?.subjects?.map((sub, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{sub.subject}</TableCell>
                        <TableCell>{sub.code}</TableCell>
                        <TableCell className="text-right">{sub.totalMax}</TableCell>
                        <TableCell className="text-right font-medium">{sub.totalObtained}</TableCell>
                        <TableCell className="text-right">{sub.percentage}%</TableCell>
                        <TableCell className="text-right font-bold text-blue-600">{sub.grade}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Final Grade Summary */}
          {report?.subjects?.length > 0 && (
            <div className="flex flex-col md:flex-row shadow-sm border rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-6 md:w-1/3 flex flex-col justify-center items-center text-center">
                <Award className="w-12 h-12 mb-2 opacity-80" />
                <h4 className="text-blue-100 font-medium mb-1">Final Grade</h4>
                <div className="text-5xl font-bold">{report?.summary?.grade}</div>
              </div>
              <div className="p-6 md:w-2/3 bg-gray-50 flex items-center">
                <div className="grid grid-cols-2 gap-8 w-full">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Marks Obtained</p>
                    <p className="text-2xl font-bold">{report?.summary?.totalScore} <span className="text-lg text-gray-400 font-normal">/ {report?.summary?.totalMaxMarks}</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Overall Percentage</p>
                    <p className="text-2xl font-bold">{report?.summary?.percentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Signature Block for Print */}
          <div className="hidden print:flex justify-between mt-24 pt-8 border-t">
            <div className="text-center w-48">
              <hr className="border-gray-400 mb-2" />
              <p className="text-sm font-medium">Class Teacher</p>
            </div>
            <div className="text-center w-48">
              <hr className="border-gray-400 mb-2" />
              <p className="text-sm font-medium">Principal</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
