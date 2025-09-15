'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Mail, Phone, GraduationCap, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import useStudentStore from '@/store/studentStore';
import StudentForm from '@/components/admin/StudentForm';

export default function StudentsPage() {
  const { students, loading, error, fetchStudents, addStudent, updateStudent, deleteStudent } = useStudentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudent(studentId);
    }
  };
  
  const handleSave = async (data) => {
    if (selectedStudent) {
      // Update existing student (exclude username/password)
      const { username, password, ...profileData } = data;
      return await updateStudent(selectedStudent._id, profileData);
    } else {
      // Add new student
      return await addStudent(data);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
           <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary" className="ml-4">
              {filteredStudents.length} students
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Loading students...
                      </TableCell>
                    </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                           <div className="rounded-full bg-blue-100 p-2">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.rollNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        {student.class ? `${student.class.name} - ${student.class.section}` : <span className="text-gray-400">N/A</span>}
                      </TableCell>
                       <TableCell>
                        <div>
                            <div className="text-sm text-gray-900">{student.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(student)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(student._id)} className="text-red-600">
                               <Trash2 className="mr-2 h-4 w-4" />
                               <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

       <StudentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        student={selectedStudent}
        onSave={handleSave}
      />
    </div>
  );
}