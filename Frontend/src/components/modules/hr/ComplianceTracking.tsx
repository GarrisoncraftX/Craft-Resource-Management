import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Clock, FileText, Award } from 'lucide-react';
import { toast } from 'sonner';
import { integrationService } from '@/services/integration/CrossModuleIntegration';
import { useAuth } from '@/contexts/AuthContext';

interface ComplianceItem {
  id: number;
  employeeId: number;
  employeeName: string;
  category: 'fit-and-proper' | 'background-check' | 'aml-kyc' | 'certification' | 'training';
  status: 'pending' | 'in-progress' | 'completed' | 'expired' | 'failed';
  dueDate: string;
  completedDate?: string;
  expiryDate?: string;
  notes?: string;
  documentUrl?: string;
}

/**
 * HR Compliance Tracking Component
 * Banking-specific: Fit-and-Proper, Background Checks, AML/KYC Training
 */
export const ComplianceTracking: React.FC = () => {
  const { user } = useAuth();
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadComplianceData();
  }, []);

  // Setup integration listeners for employee onboarding
  useEffect(() => {
    integrationService.on('employee:onboarded', (event) => {
      // When employee is onboarded, create initial compliance tasks
      const payload = event.payload;
      if (payload.riskSensitivePosition) {
        createComplianceTasks(payload.employeeId, payload.employeeName);
      }
    });

    integrationService.on('employee:offboarding-initiated', (event) => {
      // When offboarding starts, flag compliance review needed
      const payload = event.payload;
      console.log(`[v0] Compliance review triggered for offboarding: ${payload.employeeName}`);
    });
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // In real implementation: const data = await fetchComplianceData();
      // For now, mock data
      setComplianceItems([
        {
          id: 1,
          employeeId: 1,
          employeeName: 'John Doe',
          category: 'fit-and-proper',
          status: 'completed',
          dueDate: '2024-01-15',
          completedDate: '2024-01-10',
          expiryDate: '2026-01-10',
          notes: 'Banking fit-and-proper check completed and approved',
        },
        {
          id: 2,
          employeeId: 1,
          employeeName: 'John Doe',
          category: 'aml-kyc',
          status: 'completed',
          dueDate: '2024-02-01',
          completedDate: '2024-02-01',
          expiryDate: '2025-02-01',
          notes: 'AML/KYC Training completed',
        },
        {
          id: 3,
          employeeId: 2,
          employeeName: 'Jane Smith',
          category: 'background-check',
          status: 'in-progress',
          dueDate: '2024-03-15',
          notes: 'Background check in progress with external provider',
        },
      ]);
    } catch (error) {
      toast.error('Failed to load compliance data');
      console.error('[v0] Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createComplianceTasks = (employeeId: number, employeeName: string) => {
    const newTasks: ComplianceItem[] = [
      {
        id: Math.random(),
        employeeId,
        employeeName,
        category: 'fit-and-proper',
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        id: Math.random(),
        employeeId,
        employeeName,
        category: 'aml-kyc',
        status: 'pending',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ];
    setComplianceItems([...complianceItems, ...newTasks]);
    toast.success(`Compliance tasks created for ${employeeName}`);
  };

  const completeComplianceItem = async (id: number) => {
    const item = complianceItems.find(c => c.id === id);
    if (!item || !user) return;

    try {
      // Log to audit
      integrationService.logAudit({
        correlationId: `comp-${id}`,
        module: 'HR',
        action: 'COMPLIANCE_COMPLETED',
        resourceType: 'Compliance',
        resourceId: id.toString(),
        userId: user.id,
        timestamp: new Date().toISOString(),
        status: 'success',
        changes: [
          {
            field: 'status',
            oldValue: item.status,
            newValue: 'completed',
          },
        ],
      });

      setComplianceItems(
        complianceItems.map(c =>
          c.id === id
            ? { ...c, status: 'completed', completedDate: new Date().toISOString().split('T')[0] }
            : c
        )
      );
      toast.success('Compliance item completed');
    } catch (error) {
      toast.error('Failed to complete compliance item');
      console.error('[v0] Error completing compliance:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'outline';
      case 'expired':
      case 'failed':
        return 'destructive';
      case 'in-progress':
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fit-and-proper':
        return <CheckCircle className="h-4 w-4" />;
      case 'background-check':
        return <FileText className="h-4 w-4" />;
      case 'aml-kyc':
        return <Award className="h-4 w-4" />;
      case 'certification':
      case 'training':
        return <Award className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredItems = complianceItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  const completionRate = complianceItems.length > 0
    ? (complianceItems.filter(c => c.status === 'completed').length / complianceItems.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Banking Compliance Overview</CardTitle>
          <CardDescription>Fit-and-Proper, AML/KYC, Background Checks & Certifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Compliance Rate</span>
              <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{complianceItems.filter(c => c.status === 'completed').length}</div>
                <p className="text-sm text-gray-600">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-yellow-600">{complianceItems.filter(c => c.status === 'pending').length}</div>
                <p className="text-sm text-gray-600">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{complianceItems.filter(c => c.status === 'in-progress').length}</div>
                <p className="text-sm text-gray-600">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{complianceItems.filter(c => c.status === 'expired' || c.status === 'failed').length}</div>
                <p className="text-sm text-gray-600">Expired/Failed</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Compliance Checklist</CardTitle>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Compliance Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Compliance Requirement</DialogTitle>
                </DialogHeader>
                {/* Form would go here */}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fit-and-proper">Fit-and-Proper</SelectItem>
                  <SelectItem value="background-check">Background Check</SelectItem>
                  <SelectItem value="aml-kyc">AML/KYC</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.employeeName}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">{item.category.replace('-', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(item.status)} className="flex gap-1 w-fit">
                        {getStatusIcon(item.status)}
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>{item.completedDate || '-'}</TableCell>
                    <TableCell>{item.expiryDate || '-'}</TableCell>
                    <TableCell>
                      {item.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeComplianceItem(item.id)}
                        >
                          Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
