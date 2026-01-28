import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import type { LeaveRequest } from '@/types/nodejsbackendapi/leaveTypes';

interface LeaveRequestsProps {
  requests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (request: LeaveRequest) => void;
  processingRequests: Set<string>;
}

export const LeaveRequests: React.FC<LeaveRequestsProps> = ({
  requests,
  onApprove,
  onReject,
  onView,
  processingRequests
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
        <CardDescription>Manage and approve employee leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.User ? `${request.User.firstName} ${request.User.lastName}` : `Employee ${request.userId}`}
                </TableCell>
                <TableCell>{request.leaveType?.name || `Leave Type ${request.leaveTypeId}`}</TableCell>
                <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}</TableCell>
                <TableCell>{request.reason || 'No reason provided'}</TableCell>
                <TableCell>
                  <Badge variant={request.status === 'approved' ? 'default' : request.status === 'pending' ? 'secondary' : 'destructive'}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(request)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {request.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => onApprove(request.id)} disabled={processingRequests.has(request.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onReject(request.id)} disabled={processingRequests.has(request.id)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
