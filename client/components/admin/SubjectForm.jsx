'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SubjectForm({ open, onOpenChange, subject, onSave }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const isEditMode = Boolean(subject);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
      });
    }
    setError('');
  }, [subject, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await onSave(formData);
    if (!result?.success) {
      setError(result?.error || 'Failed to save subject');
    } else {
       onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">Code</Label>
            <Input id="code" name="code" value={formData.code || ''} onChange={handleChange} className="col-span-3" required />
          </div>

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
