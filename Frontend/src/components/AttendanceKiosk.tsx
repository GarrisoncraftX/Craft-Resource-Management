import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, KeyRound, CheckCircle, Loader2, QrCode, ArrowLeft, Home } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';
import { PageLoadingSpinner } from '@/components/LoadingSpinner';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useNavigate } from 'react-router-dom';

export const AttendanceKiosk: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();


  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<'clock-in' | 'clock-out' | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [manualData, setManualData] = useState({
    employeeId: '',
    password: '',
  });



  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSubmit = async () => {
    if (!manualData.employeeId || !manualData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both Employee ID and Password',
        variant: 'destructive',
      });
      return;
    }
    await processAttendance('manual', manualData);
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
        setManualData({ employeeId: '', password: '' });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-muted-foreground/80 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground/80 hover:text-muted-foreground hover:bg-white/10 p-2"
          >
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <span>/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground/80 hover:text-muted-foreground hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span>/</span>
          <span className="text-muted-foreground">Attendance Kiosk</span>
        </div>

        <div className="text-center text-muted-foreground space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-12 w-12 mr-3" />
            <h1 className="text-5xl font-bold">Employee Attendance</h1>
          </div>
          <p className="text-3xl font-mono font-bold">{formatTime(currentTime)}</p>
          <p className="text-lg text-blue-100">{formatDate(currentTime)}</p>
        </div>

        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl">Mark Your Attendance</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to record attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="manual">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual" className="text-base">
                  <KeyRound className="mr-2 h-5 w-5" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="qr" className="text-base">
                  <QrCode className="mr-2 h-5 w-5" />
                  QR Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-6">
                <Alert><KeyRound className="h-4 w-4" /><AlertDescription>Enter your credentials to record attendance.</AlertDescription></Alert>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employeeId" className="text-base">Employee ID</Label>
                    <Input id="employeeId" placeholder="Enter employee ID" value={manualData.employeeId} onChange={(e) => setManualData({ ...manualData, employeeId: e.target.value })} className="h-12 text-lg" />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-base">Password</Label>
                    <Input id="password" type="password" placeholder="Enter password" value={manualData.password} onChange={(e) => setManualData({ ...manualData, password: e.target.value })} className="h-12 text-lg" />
                  </div>
                  <Button onClick={handleManualSubmit} size="lg" className="w-full h-16 text-lg" disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" />Processing...</> : 'Submit'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="qr" className="space-y-6">
                <Alert><QrCode className="h-4 w-4" /><AlertDescription>Generate QR code for attendance verification. Employees can scan this code with their mobile devices.</AlertDescription></Alert>
                <QRCodeDisplay type="attendance" />
              </TabsContent>
            </Tabs>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Security:</strong> AES-256 Encrypted | <strong>Audit:</strong> Fully Logged
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
