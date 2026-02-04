import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Loader2, QrCode, ArrowLeft, Home } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';
import { PageLoadingSpinner } from '@/components/LoadingSpinner';
import { QRCodeDisplay } from './QRCodeDisplay';
import { ManualEntryModal } from './ManualEntryModal';
import { useNavigate } from 'react-router-dom';

export const AttendanceKiosk: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();


  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<'clock-in' | 'clock-out' | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showManualModal, setShowManualModal] = useState(false);



  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSubmit = async (employeeId: string, password: string) => {
    if (!employeeId || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both Employee ID and Password',
        variant: 'destructive',
      });
      return;
    }
    await processAttendance('manual', { employeeId, password });
    setShowManualModal(false);
  };

  const processAttendance = async (
    method: 'manual',
    payload: Record<string, unknown>
  ) => {
    setIsProcessing(true);

    try {
      let action: 'clock-in' | 'clock-out' = 'clock-in';

      // Determine if this is clock-in or clock-out based on current attendance status
      const currentAttendanceResponse = await apiClient.get(`/attendance/current/${payload.employeeId}`);
      const hasCurrentAttendance = currentAttendanceResponse && !currentAttendanceResponse.clock_out_time;

      action = hasCurrentAttendance ? 'clock-out' : 'clock-in';

      const endpoint = action === 'clock-in' ? '/attendance/manual-clock-in' : '/attendance/manual-clock-out';
      const response = await apiClient.post(endpoint, {
        employeeId: payload.employeeId,
        password: payload.password,
      });

      setLastAction(action);
      setEmployeeName(response.user?.first_name + ' ' + response.user?.last_name || 'Employee');

      toast({
        title: 'Success!',
        description: `Successfully ${action === 'clock-in' ? 'clocked in' : 'clocked out'}`,
      });

      setTimeout(() => {
        setLastAction(null);
        setEmployeeName('');
        setShowManualModal(false);
      }, 5000);
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Show loading for mobile processing
  if (isProcessing && !lastAction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <PageLoadingSpinner />
          <h2 className="text-xl font-semibold text-gray-700">Processing Attendance...</h2>
          <p className="text-gray-500">Please wait while we record your attendance.</p>
        </div>
      </div>
    );
  }

  if (lastAction && employeeName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle className="h-20 w-20 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-green-900">
                {lastAction === 'clock-in' ? 'Welcome!' : 'See You Soon!'}
              </h2>
              <p className="text-xl text-green-700">Hello, <span className="font-semibold">{employeeName}</span></p>
              <p className="text-2xl font-mono font-bold text-green-900">{formatTime(currentTime)}</p>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {lastAction === 'clock-in' ? 'Checked IN' : 'Checked OUT'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-6xl w-full space-y-4 sm:space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-white/80 text-xs sm:text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 sm:p-2 h-auto"
          >
            <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <span>/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 sm:p-2 h-auto"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <span>/</span>
          <span className="text-white text-xs sm:text-sm">Attendance Kiosk</span>
        </div>

        <div className="text-center text-white space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Employee Attendance</h1>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-mono font-bold">{formatTime(currentTime)}</p>
          <p className="text-sm sm:text-base md:text-lg text-blue-100">{formatDate(currentTime)}</p>
        </div>

        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Mark Your Attendance</CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-base">
              Scan the QR code to record your attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 space-y-4 sm:space-y-6">
            <QRCodeDisplay type="attendance" onScanFailure={() => setShowManualModal(true)} />
            
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowManualModal(true)}
                className="text-xs sm:text-sm"
              >
                Having trouble? Try manual entry
              </Button>
            </div>

            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-900 text-center">
                <strong>Security:</strong> AES-256 Encrypted | <strong>Audit:</strong> Fully Logged
              </p>
            </div>
          </CardContent>
        </Card>

        <ManualEntryModal
          open={showManualModal}
          onOpenChange={setShowManualModal}
          onSubmit={handleManualSubmit}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};
