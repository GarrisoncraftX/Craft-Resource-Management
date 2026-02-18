import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { integrationService } from '@/services/integration/CrossModuleIntegration';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface EmployeeAssetAssignment {
  employeeId: number;
  employeeName: string;
  assetId: number;
  assetTag: string;
  assetName: string;
  assignmentDate: string;
  expectedReturnDate?: string;
  status: 'assigned' | 'pending-return' | 'returned';
  condition?: string;
}

/**
 * HR-Assets Integration Component
 * Tracks asset assignments during onboarding and returns during offboarding
 */
export const HRAssetsIntegration: React.FC<{ employeeId: number }> = ({ employeeId }) => {
  const [assignments, setAssignments] = useState<EmployeeAssetAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssetAssignments();
  }, [employeeId]);

  const loadAssetAssignments = async () => {
    setLoading(true);
    try {
      // In real implementation, fetch from API
      // const data = await fetchEmployeeAssetAssignments(employeeId);
      // setAssignments(data);
      console.log(`[v0] Loading asset assignments for employee ${employeeId}`);
    } catch (error) {
      console.error('[v0] Failed to load asset assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetReturn = (assignment: EmployeeAssetAssignment) => {
    // Log asset return to integration service
    integrationService.logAssetAssignment(
      {
        assetId: assignment.assetId,
        assetTag: assignment.assetTag,
        assignedTo: employeeId,
        employeeName: assignment.employeeName,
        assignmentDate: new Date().toISOString(),
      },
      'system' // Would be actual user ID
    );

    console.log(`Asset return logged: ${assignment.assetTag} from ${assignment.employeeName}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'returned':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending-return':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'assigned':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'returned':
        return 'outline';
      case 'pending-return':
        return 'secondary';
      case 'assigned':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Assignments & Returns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignments.length === 0 && !loading && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No asset assignments found for this employee</AlertDescription>
          </Alert>
        )}

        {assignments.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Assignment Date</TableHead>
                <TableHead>Expected Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={`${assignment.employeeId}-${assignment.assetId}`}>
                  <TableCell className="font-mono text-sm">{assignment.assetTag}</TableCell>
                  <TableCell>{assignment.assetName}</TableCell>
                  <TableCell>{new Date(assignment.assignmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {assignment.expectedReturnDate
                      ? new Date(assignment.expectedReturnDate).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(assignment.status)} className="flex gap-1 w-fit">
                      {getStatusIcon(assignment.status)}
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {assignment.status === 'assigned' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssetReturn(assignment)}
                      >
                        Mark Returned
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
  );
};
