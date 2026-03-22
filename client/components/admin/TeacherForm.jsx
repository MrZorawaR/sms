'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TeacherForm({ open, onOpenChange, teacher, onSave }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const isEditMode = Boolean(teacher);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        employeeId: teacher.employeeId || '',
        department: teacher.department || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        username: '',
        password: '',
      });
    }
    setError(''); 
  }, [teacher, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isEditMode && (!formData.username || !formData.password)) {
      setError('Username and password are required for new teachers.');
      return;
    }

    const result = await onSave(formData);
    if (!result.success) {
      setError(result.error);
    } else {
       onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
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
            <Label htmlFor="employeeId" className="text-right">Emp ID</Label>
            <Input id="employeeId" name="employeeId" value={formData.employeeId || ''} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">Department</Label>
            <Input id="department" name="department" value={formData.department || ''} onChange={handleChange} className="col-span-3" required />
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
