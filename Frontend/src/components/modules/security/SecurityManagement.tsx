import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users } from 'lucide-react';
import { securityApiService, type GuardPost, type SOP } from '@/services/javabackendapi/securityApi';
import { mockGuardPosts, mockSOPs } from '@/services/mockData/security';
import { useToast } from '@/hooks/use-toast';
import { GuardPostDialog } from './dialogs/GuardPostDialog';
import { SOPDialog } from './dialogs/SOPDialog';

export const SecurityManagement: React.FC = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<GuardPost[]>([]);
  const [sops, setSOPs] = useState<SOP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isSOPDialogOpen, setIsSOPDialogOpen] = useState(false);
  const [postFormData, setPostFormData] = useState({ post: '', guards: 1, shift: 'Day', status: 'Active' });
  const [sopFormData, setSOPFormData] = useState({ title: '', category: '', version: '1.0', status: 'Active', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [postsData, sopsData] = await Promise.all([
        securityApiService.getGuardPosts().catch(() => mockGuardPosts),
        securityApiService.getSOPs().catch(() => mockSOPs),
      ]);
      setPosts(postsData);
      setSOPs(sopsData);
    } catch (error) {
      console.warn('Failed to load data, using mock data:', error);
      setPosts(mockGuardPosts);
      setSOPs(mockSOPs);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await securityApiService.createGuardPost(postFormData);
      toast({ title: 'Success', description: 'Guard post created successfully' });
      setIsPostDialogOpen(false);
      setPostFormData({ post: '', guards: 1, shift: 'Day', status: 'Active' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create guard post', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSOPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await securityApiService.createSOP(sopFormData);
      toast({ title: 'Success', description: 'SOP created successfully' });
      setIsSOPDialogOpen(false);
      setSOPFormData({ title: '', category: '', version: '1.0', status: 'Active', description: '' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create SOP', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Management</h2>
          <p className="text-muted-foreground">Administer guard posts, schedules, and SOPs</p>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Guard Posts</TabsTrigger>
          <TabsTrigger value="sops">SOPs</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Guard Posts</CardTitle>
                  <CardDescription>Staffing and shift allocations ({posts.length})</CardDescription>
                </div>
                <GuardPostDialog
                  open={isPostDialogOpen}
                  onOpenChange={setIsPostDialogOpen}
                  formData={postFormData}
                  onFormChange={setPostFormData}
                  onSubmit={handlePostSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Post</TableHead>
                      <TableHead>Guards</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.id}</TableCell>
                        <TableCell>{p.post}</TableCell>
                        <TableCell><Users className="h-4 w-4 inline mr-1" />{p.guards}</TableCell>
                        <TableCell>{p.shift}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'Active' ? 'default' : 'secondary'}>{p.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sops">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Standard Operating Procedures</CardTitle>
                  <CardDescription>Security protocols and guidelines ({sops.length})</CardDescription>
                </div>
                <SOPDialog
                  open={isSOPDialogOpen}
                  onOpenChange={setIsSOPDialogOpen}
                  formData={sopFormData}
                  onFormChange={setSOPFormData}
                  onSubmit={handleSOPSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sops.map((sop) => (
                      <TableRow key={sop.id}>
                        <TableCell className="font-medium">{sop.id}</TableCell>
                        <TableCell>{sop.title}</TableCell>
                        <TableCell>{sop.category}</TableCell>
                        <TableCell>{sop.version}</TableCell>
                        <TableCell>{sop.lastUpdated}</TableCell>
                        <TableCell>
                          <Badge variant={sop.status === 'Active' ? 'default' : 'secondary'}>{sop.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityManagement;
