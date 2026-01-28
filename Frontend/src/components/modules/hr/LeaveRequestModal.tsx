import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { LeaveRequest } from '@/types/nodejsbackendapi/leaveTypes';

interface LeaveRequestModalProps {
  request: LeaveRequest;
  onClose: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ request, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      role="button"
      tabIndex={0}
      aria-label="Close dialog"
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Leave Request Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Employee</p>
            <p className="font-medium">{request.User ? `${request.User.firstName} ${request.User.lastName}` : `Employee ${request.userId}`}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Leave Type</p>
            <p className="font-medium">{request.leaveType?.name || `Leave Type ${request.leaveTypeId}`}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{new Date(request.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{new Date(request.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Days</p>
            <p className="font-medium">{request.totalDays}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="font-medium">{request.reason || 'No reason provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Supporting Documents</p>
            {request.supportingDocuments && request.supportingDocuments.length > 0 ? (
              <div className="space-y-2">
                {request.supportingDocuments.map((doc, docIndex) => (
                  <a
                    key={doc}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Document {docIndex + 1}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No documents uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
