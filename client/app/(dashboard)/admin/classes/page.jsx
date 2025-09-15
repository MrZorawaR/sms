'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Users } from 'lucide-react';
import useClassStore from '@/store/classStore';
import ClassForm from '@/components/admin/ClassForm';

export default function ClassesPage() {
  const { classes, loading, error, fetchClasses, addClass, updateClass } = useClassStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

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
    </div>
  );
}
