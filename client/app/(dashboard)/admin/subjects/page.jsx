'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Edit, Trash2, BookOpen } from 'lucide-react';
import useSubjectStore from '@/store/subjectStore';
import SubjectForm from '@/components/admin/SubjectForm';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function SubjectsPage() {
  const { subjects, currentPage, totalPages, totalRecords, loading, error, fetchSubjects, addSubject, updateSubject, deleteSubject } = useSubjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  useEffect(() => {
    fetchSubjects(1, 10);
  }, [fetchSubjects]);

  const handleNextPage = () => {
    if (currentPage < totalPages) fetchSubjects(currentPage + 1, 10);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) fetchSubjects(currentPage - 1, 10);
  };

  const handleAdd = () => {
    setSelectedSubject(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (subjectId) => {
    setSubjectToDelete(subjectId);
  };

  const confirmDelete = async () => {
    if (subjectToDelete) {
      await deleteSubject(subjectToDelete);
      setSubjectToDelete(null);
    }
  };
  
  const handleSave = async (data) => {
    if (selectedSubject) {
      return await updateSubject(selectedSubject._id, data);
    } else {
      return await addSubject(data);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <CardTitle>Subject Directory</CardTitle>
           <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary" className="ml-4">
              {filteredSubjects.length} subjects
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Assigned Teacher</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Loading subjects...</TableCell></TableRow>
                ) : filteredSubjects.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No subjects found</TableCell></TableRow>
                ) : (
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                           <div className="rounded-full bg-blue-100 p-2">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="font-medium">{subject.name}</div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{subject.code}</Badge></TableCell>
                      <TableCell>{subject.teacher ? subject.teacher.name : <span className="text-gray-400">Not Assigned</span>}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(subject)}>
                              <Edit className="mr-2 h-4 w-4" /><span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(subject._id)} className="text-red-600">
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

          <div className="flex items-center justify-between px-2 py-4 border-t mt-4">
            <div className="text-sm text-gray-500">
              Showing page {currentPage} of {totalPages} ({totalRecords} total records)
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1 || loading}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages || loading}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

       <SubjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        subject={selectedSubject}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This action cannot be undone."
      />
    </div>
  );
}
