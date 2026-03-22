'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MoreHorizontal, Edit, Users, UserPlus, BookPlus } from 'lucide-react';
import useClassStore from '@/store/classStore';
import useTeacherStore from '@/store/teacherStore';
import useSubjectStore from '@/store/subjectStore';
import ClassForm from '@/components/admin/ClassForm';

export default function ClassesPage() {
  const { classes, loading, error, fetchClasses, addClass, updateClass, assignTeacher, assignSubject } = useClassStore();
  const { teachers, fetchTeachers } = useTeacherStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [assignTeacherOpen, setAssignTeacherOpen] = useState(false);
  const [assignSubjectOpen, setAssignSubjectOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
  }, [fetchClasses, fetchTeachers, fetchSubjects]);

  const handleAdd = () => {
    setSelectedClass(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (classData) => {
    setSelectedClass(classData);
    setIsFormOpen(true);
  };

  const handleSave = async (data) => {
    if (selectedClass) {
      return await updateClass(selectedClass._id, data);
    } else {
      return await addClass(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Assigned Teacher</TableHead>
                  <TableHead>Student Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Loading classes...
                    </TableCell>
                  </TableRow>
                ) : classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No classes found. Add a new class to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.map((classItem) => (
                    <TableRow key={classItem._id}>
                      <TableCell>
                        <div className="font-medium">{classItem.name} - {classItem.section}</div>
                      </TableCell>
                      <TableCell>{classItem.academicYear}</TableCell>
                      <TableCell>{classItem.teacher ? classItem.teacher.name : <span className="text-gray-400">Not Assigned</span>}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          {classItem.students?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(classItem)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedClass(classItem); setAssignTeacherOpen(true); }}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              <span>Assign Teacher</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedClass(classItem); setAssignSubjectOpen(true); }}>
                              <BookPlus className="mr-2 h-4 w-4" />
                              <span>Assign Subject</span>
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

      <ClassForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        classData={selectedClass}
        onSave={handleSave}
      />

      <Dialog open={assignTeacherOpen} onOpenChange={setAssignTeacherOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Teacher to Class</DialogTitle></DialogHeader>
          <div className="py-4">
            <Select onValueChange={setSelectedTeacher} value={selectedTeacher}>
              <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
              <SelectContent>
                {teachers.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={async () => {
              if (selectedTeacher && selectedClass) {
                await assignTeacher(selectedClass._id, selectedTeacher);
                setAssignTeacherOpen(false);
                setSelectedTeacher('');
              }
            }}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignSubjectOpen} onOpenChange={setAssignSubjectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Subject to Class</DialogTitle></DialogHeader>
          <div className="py-4">
            <Select onValueChange={setSelectedSubject} value={selectedSubject}>
              <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name} ({s.code})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={async () => {
              if (selectedSubject && selectedClass) {
                await assignSubject(selectedClass._id, selectedSubject);
                setAssignSubjectOpen(false);
                setSelectedSubject('');
              }
            }}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
