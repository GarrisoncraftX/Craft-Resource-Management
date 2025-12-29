import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Clock, MapPin, User } from 'lucide-react';

interface ClockInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    role: string;
    profilePictureUrl?: string;
  };
  clockInTime: string;
  clockInMethod: string;
}

export const ClockInSuccessModal: React.FC<ClockInSuccessModalProps> = ({
  isOpen,
  onClose,
  employeeData,
  clockInTime,
  clockInMethod,
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-green-700">
            Clock In Successful!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Profile Section */}
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <Avatar className="h-16 w-16 ring-4 ring-blue-200">
              {employeeData.profilePictureUrl ? (
                <AvatarImage src={employeeData.profilePictureUrl} alt={`${employeeData.firstName} ${employeeData.lastName}`} />
              ) : (
                <AvatarFallback className="text-xl font-bold bg-blue-500 text-white">
                  {employeeData.firstName?.charAt(0)}{employeeData.lastName?.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900">
                {employeeData.firstName} {employeeData.lastName}
              </h3>
              <p className="text-sm text-blue-700">{employeeData.role}</p>
              <p className="text-sm text-blue-600">{employeeData.department}</p>
            </div>
          </div>

          {/* Clock In Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Clock In Time</p>
                <p className="text-sm text-green-700">{formatTime(clockInTime)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Employee ID</p>
                <p className="text-sm text-blue-700">{employeeData.employeeId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Clock In Method</p>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {clockInMethod}
                </Badge>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              Welcome to work! You have successfully clocked in.
            </p>
            <p className="text-sm text-green-700 mt-1">
              Don't forget to clock out at the end of your shift.
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClockInSuccessModal;
