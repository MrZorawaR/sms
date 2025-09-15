'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ClassForm({ open, onOpenChange, classData, onSave }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const isEditMode = Boolean(classData);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: classData.name || '',
        section: classData.section || '',
        academicYear: classData.academicYear || '',
      });
    } else {
      setFormData({
        name: '',
        section: '',
        academicYear: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
      });
    }
    setError('');
  }, [classData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
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
          <DialogTitle>{isEditMode ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Class Name</Label>
            <Input id="name" name="name" placeholder="e.g., Grade 10" value={formData.name || ''} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="section" className="text-right">Section</Label>
            <Input id="section" name="section" placeholder="e.g., A" value={formData.section || ''} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="academicYear" className="text-right">Academic Year</Label>
            <Input id="academicYear" name="academicYear" placeholder="e.g., 2024-2025" value={formData.academicYear || ''} onChange={handleChange} className="col-span-3" required />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
