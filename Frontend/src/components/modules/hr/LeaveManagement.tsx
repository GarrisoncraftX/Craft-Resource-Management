import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, Filter, Users } from 'lucide-react';
import { leaveApiService } from '@/services/nodejsbackendapi/leaveApi';
import type { LeaveRequest, LeaveBalance, LeaveStatistics, LeaveType } from '@/types/nodejsbackendapi/leaveTypes';
import { LeaveRequests } from './LeaveRequests';
import { LeaveBalances } from './LeaveBalances';
import { LeaveCalendar } from './LeaveCalendar';
import { LeavePolicies } from './LeavePolicies';
import { LeaveRequestModal } from './LeaveRequestModal';
import { useToast } from '@/hooks/use-toast';

export const LeaveManagement: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('requests');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [statistics, setStatistics] = useState<LeaveStatistics | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [viewingRequest, setViewingRequest] = useState<LeaveRequest | null>(null);

  // Filter leave requests based on status
  const filteredLeaveRequests = (leaveRequests || []).filter(request => {
    if (statusFilter === 'all') return true;
    return request.status === statusFilter;
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [requestsData, balancesData, statsData, typesData] = await Promise.all([
        leaveApiService.getAllLeaveRequests(),
        leaveApiService.getAllLeaveBalances(),
        leaveApiService.getLeaveStatistics(),
        leaveApiService.getLeaveTypes()
      ]);

      // Ensure data is in expected format before setting state
      const requests = Array.isArray(requestsData) ? requestsData : [];
      const types = Array.isArray(typesData) ? typesData : [];

      // Map leave types to requests based on leaveTypeId
      const requestsWithTypes = requests.map(request => ({
        ...request,
        leaveType: types.find(type => type.id === request.leaveTypeId) || request.leaveType
      }));

      setLeaveRequests(requestsWithTypes);
      setLeaveBalances(Array.isArray(balancesData) ? balancesData : []);
      setStatistics(statsData);
      setLeaveTypes(types);
    } catch (err) {
      setError('Failed to load leave management data');
      console.error('Error loading leave data:', err);
      setLeaveRequests([]);
      setLeaveBalances([]);
      setStatistics(null);
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  };


  const handleInitializeBalances = async (userId: number) => {
    try {
      await leaveApiService.initializeLeaveBalances(userId);
      toast({ title: 'Success', description: 'Leave balances initialized successfully', variant: 'default' });
      await loadData();
    } catch (err) {
      const error = err as Error;
      const errorMsg = error?.message || 'Failed to initialize leave balances';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      console.error('Error initializing leave balances:', err);
    }
  };

  const handleSavePolicy = async (policy: Partial<LeaveType>, isNew: boolean, id?: number) => {
    try {
      if (isNew) {
        await leaveApiService.createLeaveType(policy);
        toast({ title: 'Success', description: 'Leave policy created successfully', variant: 'default' });
      } else if (id) {
        await leaveApiService.updateLeaveType(id, policy);
        toast({ title: 'Success', description: 'Leave policy updated successfully', variant: 'default' });
      }
      await loadData();
    } catch (err) {
      const error = err as Error;
      const errorMsg = error?.message || 'Failed to save policy';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      console.error('Error saving policy:', err);
    }
  };

  const handleDeletePolicy = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leave policy?')) return;
    try {
      await leaveApiService.deleteLeaveType(id);
      toast({ title: 'Success', description: 'Leave policy deleted successfully', variant: 'default' });
      await loadData();
    } catch (err) {
      const error = err as Error;
      const errorMsg = error?.message || 'Failed to delete policy';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      console.error('Error deleting policy:', err);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (processingRequests.has(requestId)) return;
    
    setProcessingRequests(prev => new Set(prev).add(requestId));
    try {
      await leaveApiService.approveLeaveRequest(requestId);
      toast({ title: 'Success', description: 'Leave request approved successfully', variant: 'default' });
      await loadData();
    } catch (err) {
      const error = err as Error;
      const errorMsg = error?.message || 'Failed to approve leave request';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      console.error('Error approving leave request:', err);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (processingRequests.has(requestId)) return;
    
    setProcessingRequests(prev => new Set(prev).add(requestId));
    try {
      await leaveApiService.rejectLeaveRequest(requestId, 1, 'Request rejected');
      toast({ title: 'Success', description: 'Leave request rejected successfully', variant: 'default' });
      await loadData();
    } catch (err) {
      const error = err as Error;
      const errorMsg = error?.message || 'Failed to reject leave request';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
      console.error('Error rejecting leave request:', err);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leave management data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
            <p className="text-muted-foreground">Manage employee leave requests and balances</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Leave Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.pendingRequests}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.approvedToday}</div>
                <p className="text-xs text-muted-foreground">Requests approved</p>
              </CardContent>
            </Card>

              <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Approved Leaves</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalApprovedLeaves}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Leave This Month</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.employeesOnLeave}</div>
                <p className="text-xs text-muted-foreground">Employees currently on leave</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
            <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
            <TabsTrigger value="policies">Leave Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <LeaveRequests
              requests={filteredLeaveRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onView={setViewingRequest}
              processingRequests={processingRequests}
            />
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            <LeaveBalances balances={leaveBalances} onInitialize={handleInitializeBalances} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <LeaveCalendar requests={leaveRequests} />
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <LeavePolicies
              policies={leaveTypes}
              onSave={handleSavePolicy}
              onDelete={handleDeletePolicy}
            />
          </TabsContent>
        </Tabs>
      </div>

      {viewingRequest && <LeaveRequestModal request={viewingRequest} onClose={() => setViewingRequest(null)} />}
    </div>
  );
};
