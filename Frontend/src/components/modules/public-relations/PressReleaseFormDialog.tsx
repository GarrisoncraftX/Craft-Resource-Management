import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { publicRelationsApiService } from '@/services/nodejsbackendapi/publicRelationsApi';
import { toast } from '@/components/ui/use-toast';

interface PressReleaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const PressReleaseFormDialog: React.FC<PressReleaseFormDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState<{
    title: string;
    summary: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
    publishDate: string;
    authorId: string;
    tags: string;
    mediaContacts: string;
  }>({
    title: '',
    summary: '',
    content: '',
    status: 'draft',
    publishDate: '',
    authorId: 'USR-001',
    tags: '',
    mediaContacts: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicRelationsApiService.createPressRelease({
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
        mediaContacts: formData.mediaContacts.split(',').map(m => m.trim())
      });
      toast({ title: 'Success', description: 'Press release created successfully' });
      onSuccess();
      onOpenChange(false);
      setFormData({ title: '', summary: '', content: '', status: 'draft', publishDate: '', authorId: 'USR-001', tags: '', mediaContacts: '' });
    } catch (error: unknown) {
      console.error('Failed to create press release:', error);
      toast({ title: 'Error', description: 'Failed to create press release', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Press Release</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="min-h-[150px]" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="publishDate">Publish Date</Label>
              <Input id="publishDate" type="datetime-local" value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="Technology, Infrastructure" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
