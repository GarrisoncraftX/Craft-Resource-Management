import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Shield } from 'lucide-react';

interface SOPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: { title: string; category: string; version: string; status: string; description: string };
  onFormChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const SOPDialog: React.FC<SOPDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Shield className="h-4 w-4 mr-2" /> New SOP</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create SOP</DialogTitle>
            <DialogDescription>Add a new standard operating procedure</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => onFormChange({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={formData.category} onChange={(e) => onFormChange({ ...formData, category: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input id="version" value={formData.version} onChange={(e) => onFormChange({ ...formData, version: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => onFormChange({ ...formData, description: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create SOP
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
