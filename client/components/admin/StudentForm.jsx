'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useStudentStore from '@/store/studentStore';

export default function StudentForm({ open, onOpenChange, student, onSave }) {
  const { classes, fetchClasses } = useStudentStore();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const isEditMode = Boolean(student);

  useEffect(() => {
    // Fetch classes for the dropdown when the component mounts
    fetchClasses();
  }, [fetchClasses]);
  
  useEffect(() => {
    // Populate form data when in edit mode or reset for add mode
    if (isEditMode) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        rollNumber: student.rollNumber || '',
        class: student.class?._id || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        rollNumber: '',
        class: '',
        username: '',
        password: '',
      });
    }
    setError(''); // Reset error on open/close
  }, [student, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleClassChange = (value) => {
    setFormData({ ...formData, class: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!isEditMode && (!formData.username || !formData.password)) {
      setError('Username and password are required for new students.');
      return;
    }

    const result = await onSave(formData);
    if (!result.success) {
      setError(result.error);
    } else {
       onOpenChange(false); // Close dialog on success
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className="col-span-3" required />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rollNumber" className="text-right">Roll No.</Label>
            <Input id="rollNumber" name="rollNumber" value={formData.rollNumber || ''} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="class" className="text-right">Class</Label>
             <Select onValueChange={handleClassChange} value={formData.class || ''} name="class">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name} - Section {c.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isEditMode && (
            <>
               <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">Username</Label>
                    <Input id="username" name="username" value={formData.username || ''} onChange={handleChange} className="col-span-3" required />
                  </div>
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password"className="text-right">Password</Label>
                <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleChange} className="col-span-3" required />
              </div>
            </>
          )}

           {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
