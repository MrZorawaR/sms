'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash2, User } from 'lucide-react';
import useTeacherStore from '@/store/teacherStore';
import TeacherForm from '@/components/admin/TeacherForm';

export default function TeachersPage() {
  const { teachers, loading, error, fetchTeachers, addTeacher, updateTeacher, deleteTeacher } = useTeacherStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleAdd = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      await deleteTeacher(teacherId);
    }
  };
  
  const handleSave = async (data) => {
    if (selectedTeacher) {
      const { username, password, ...profileData } = data;
      return await updateTeacher(selectedTeacher._id, profileData);
    } else {
      return await addTeacher(data);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Teacher Directory</CardTitle>
           <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary" className="ml-4">
              {filteredTeachers.length} teachers
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading teachers...</TableCell></TableRow>
                ) : filteredTeachers.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No teachers found</TableCell></TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                           <div className="rounded-full bg-blue-100 p-2">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{teacher.employeeId}</Badge></TableCell>
                      <TableCell>{teacher.department || 'N/A'}</TableCell>
                      <TableCell><div className="text-sm text-gray-900">{teacher.phone}</div></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(teacher)}>
                              <Edit className="mr-2 h-4 w-4" /><span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(teacher._id)} className="text-red-600">
                               <Trash2 className="mr-2 h-4 w-4" /><span>Delete</span>
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

       <TeacherForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        teacher={selectedTeacher}
        onSave={handleSave}
      />
    </div>
  );
}
