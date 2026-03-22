'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useMarksStore from '@/store/marksStore';
import api from '@/lib/axios';

export default function TeacherMarks() {
  const { submitMarks, loading, error: storeError } = useMarksStore();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  
  const [examType, setExamType] = useState('Mid-Term');
  const [totalMarks, setTotalMarks] = useState(100);
  const [marksData, setMarksData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/teacher/classes').then(res => setClasses(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const cls = classes.find(c => c._id === selectedClassId);
      setSubjects(cls?.subjects || []);
      setSelectedSubjectId('');
      
      api.get(`/teacher/classes/${selectedClassId}/students`)
        .then(res => {
          setStudents(res.data);
          const initial = {};
          res.data.forEach(s => initial[s._id] = '');
          setMarksData(initial);
          setMessage('');
        })
        .catch(console.error);
    }
  }, [selectedClassId, classes]);

  const handleMarkChange = (studentId, value) => {
    setMarksData(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    
    // Submit marks one by one or as a batch? 
    // The backend /api/teacher/marks expects single student record.
    // Wait, the API `router.post('/marks', ...)` takes: studentId, subjectId, examType, score, totalMarks.
    // So we must fire multiple requests in a loop.
    let hasError = false;
    for (const studentId of Object.keys(marksData)) {
      const score = marksData[studentId];
      if (score === '' || score === null) continue;
      
      const payload = {
        studentId,
        subjectId: selectedSubjectId,
        examType,
        score: Number(score),
        totalMarks: Number(totalMarks)
      };
      const res = await submitMarks(payload);
      if (!res.success) hasError = true;
    }
    
    if (!hasError) {
      setMessage('Marks submitted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Enter Marks</h1>
      
      {storeError && <Alert variant="destructive"><AlertDescription>{storeError}</AlertDescription></Alert>}
      {message && <Alert className="bg-green-50 text-green-700 border-green-200"><AlertDescription>{message}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Select Class & Subject</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          <Select onValueChange={setSelectedClassId} value={selectedClassId}>
            <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId} disabled={!selectedClassId}>
            <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              {subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.code})</SelectItem>)}
            </SelectContent>
          </Select>

          <Select onValueChange={setExamType} value={examType}>
            <SelectTrigger><SelectValue placeholder="Exam Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Mid-Term">Mid-Term</SelectItem>
              <SelectItem value="Finals">Finals</SelectItem>
              <SelectItem value="Quiz">Quiz</SelectItem>
              <SelectItem value="Assignment">Assignment</SelectItem>
            </SelectContent>
          </Select>
          
          <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} placeholder="Total Marks" />
        </CardContent>
      </Card>

      {selectedSubjectId && students.length > 0 && (
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
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s._id}>
                    <TableCell>{s.rollNumber}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0" 
                        max={totalMarks} 
                        className="w-[120px]" 
                        value={marksData[s._id] || ''} 
                        onChange={(e) => handleMarkChange(s._id, e.target.value)} 
                        placeholder="Marks"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit All Marks'}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
