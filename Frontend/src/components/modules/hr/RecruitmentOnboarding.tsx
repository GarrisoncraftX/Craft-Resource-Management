import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Briefcase, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getAllJobPostings, createJobPosting, getOnboardingChecklist, createOnboardingTask, completeOnboardingTask } from '@/services/javabackendapi/hrApi';
import { fetchEmployees } from '@/services/api';
import type { JobPosting, OnboardingChecklist } from '@/types/javabackendapi/hrTypes';
import type { Employee } from '@/types/hr';

export const RecruitmentOnboarding: React.FC = () => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingChecklist[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<JobPosting>>({
    title: '',
    description: '',
    departmentId: undefined,
    jobGradeId: undefined,
    requiredQualifications: '',
    closingDate: '',
    status: 'DRAFT'
  });
  const [taskFormData, setTaskFormData] = useState<Partial<OnboardingChecklist>>({
    userId: undefined,
    taskName: ''
  });

  useEffect(() => {
    loadJobPostings();
    loadEmployees();
  }, []);

  const loadJobPostings = async () => {
    setLoading(true);
    try {
      const data = await getAllJobPostings();
      setJobPostings(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to load job postings:', errorMessage);
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch {
      toast.error('Failed to load employees');
    }
  };

  const loadOnboardingTasks = async (userId: number) => {
    try {
      const data = await getOnboardingChecklist(userId);
      setOnboardingTasks(data);
      setSelectedUserId(userId);
    } catch (error) {
      toast.error('Failed to load onboarding tasks');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJobPosting(formData as JobPosting);
      toast.success('Job posting created successfully');
      setDialogOpen(false);
      loadJobPostings();
      setFormData({
        title: '',
        description: '',
        departmentId: undefined,
        jobGradeId: undefined,
        requiredQualifications: '',
        closingDate: '',
        status: 'DRAFT'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to create job posting:', errorMessage);
      toast.error('Failed to create job posting');
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOnboardingTask(taskFormData as OnboardingChecklist);
      toast.success('Onboarding task created successfully');
      setTaskDialogOpen(false);
      if (selectedUserId) loadOnboardingTasks(selectedUserId);
      setTaskFormData({ userId: undefined, taskName: '' });
    } catch (error) {
      toast.error('Failed to create onboarding task');
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await completeOnboardingTask(taskId);
      toast.success('Task marked as complete');
      if (selectedUserId) loadOnboardingTasks(selectedUserId);
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recruitment & Onboarding</h1>
      </div>

      <Tabs defaultValue="postings">
        <TabsList>
          <TabsTrigger value="postings">Job Postings</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="postings" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Job Posting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Job Posting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Required Qualifications</Label>
                    <Textarea
                      value={formData.requiredQualifications}
                      onChange={(e) => setFormData({ ...formData, requiredQualifications: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Closing Date</Label>
                    <Input
                      type="date"
                      value={formData.closingDate}
                      onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'DRAFT' | 'OPEN' | 'CLOSED' | 'FILLED') => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create Posting</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Postings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Closing Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobPostings.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'OPEN' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.closingDate || 'N/A'}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4 min-h-[400px]">
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Select onValueChange={(v) => loadOnboardingTasks(Number(v))}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto" position='item-aligned' >
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium text-sm">{emp.firstName} {emp.lastName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Onboarding Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div>
                    <Label>Employee</Label>
                    <Select value={String(taskFormData.userId || '')} onValueChange={(v) => setTaskFormData({ ...taskFormData, userId: Number(v) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={String(emp.id)}>
                            <div className="flex flex-col py-1">
                              <span className="font-medium text-sm">{emp.firstName} {emp.lastName}</span>
                              <span className="text-xs text-muted-foreground">ID: {emp.id}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Task Name</Label>
                    <Input
                      value={taskFormData.taskName}
                      onChange={(e) => setTaskFormData({ ...taskFormData, taskName: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Create Task</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Onboarding Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onboardingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Select an employee to view onboarding tasks</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Task</TableHead>
                        <TableHead className="min-w-[120px]">Assigned Date</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {onboardingTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.taskName}</TableCell>
                          <TableCell>{task.assignedDate ? new Date(task.assignedDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={task.isCompleted ? 'default' : 'secondary'}>
                              {task.isCompleted ? 'Completed' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!task.isCompleted && (
                              <Button size="sm" variant="outline" onClick={() => task.id && handleCompleteTask(task.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
