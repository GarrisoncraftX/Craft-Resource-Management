import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebcamCapture } from './WebcamCapture';
import { QRCodeScanner } from './QRCodeScanner';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Clock, Scan, Camera, KeyRound, CheckCircle, Loader2, QrCode } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type KioskMode = 'SCANNER' | 'GENERATOR';

export const AttendanceKiosk: React.FC = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<KioskMode>((location.state as { mode?: KioskMode })?.mode || 'SCANNER');
  
  const [activeMethod, setActiveMethod] = useState<'face' | 'qr' | 'qr-display' | 'manual'>('face');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<'clock-in' | 'clock-out' | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const [faceData, setFaceData] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [manualData, setManualData] = useState({
    employeeId: '',
    password: '',
  });

  const handleFaceCapture = async (imageData: string) => {
    setFaceData(imageData);
    setShowWebcam(false);
    await processAttendance('face', { faceData: imageData });
  };

  const handleQRScan = async (qrData: string) => {
    try {
      let sessionToken: string;

      // Check if QR data is a URL (from backend generated QR)
      if (qrData.startsWith('http')) {
        const url = new URL(qrData);
        sessionToken = url.searchParams.get('session_token');

        if (!sessionToken) {
          throw new Error('Invalid QR code: missing session token');
        }
      } else {
        try {
          const decodedData = JSON.parse(atob(qrData));
          sessionToken = decodedData.session_token;
        } catch (decodeError) {
          console.warn('QR decode error:', decodeError);
          sessionToken = qrData;
        }
      }

      // Call the attendance QR scan API
      const response = await apiClient.post('/api/biometric/attendance/qr-scan', {
        session_token: sessionToken,
      });

      if (response.success) {
        await processAttendance('qr', {
          employeeId: response.data?.employee_id,
          action: response.action,
          employeeName: response.data?.employee_name || 'Employee'
        });
      } else if (response.requires_sign_in) {
        // User needs to sign in first
        toast({
          title: 'Sign In Required',
          description: 'Please sign in to complete your attendance check.',
          variant: 'default',
        });
        // Store session token for after login
        sessionStorage.setItem('pending_qr_session_token', sessionToken);
        // Redirect to signin with session_token
        globalThis.location.href = `/signin?session_token=${sessionToken}`;
        return;
      } else {
        toast({
          title: 'QR Code Validation Failed',
          description: response.message || 'Please try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('QR scan processing error:', error);
      toast({
        title: 'QR Code Validation Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handlePendingQRScan = async (sessionToken: string) => {
    console.log('AttendanceKiosk - Starting handlePendingQRScan with token:', sessionToken);
    try {
      // Call the attendance QR scan API directly
      console.log('AttendanceKiosk - Making API call to /api/biometric/attendance/qr-scan');
      const response = await apiClient.post('/api/biometric/attendance/qr-scan', {
        session_token: sessionToken,
      });
      console.log('AttendanceKiosk - API response:', response);

      if (response.success) {
        console.log('AttendanceKiosk - Processing successful attendance');
        await processAttendance('qr', {
          employeeId: response.data?.employee_id,
          action: response.action,
          employeeName: response.data?.employee_name || 'Employee'
        });
        console.log('AttendanceKiosk - Attendance processed successfully');
      } else {
        console.log('AttendanceKiosk - API returned success=false:', response.message);
        toast({
          title: 'QR Code Validation Failed',
          description: response.message || 'Please try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('AttendanceKiosk - Pending QR scan processing error:', error);
      toast({
        title: 'QR Code Validation Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

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

  useEffect(() => {
    if (mode === 'GENERATOR') {
      setActiveMethod('qr-display');
    } else {
      setActiveMethod('qr');
    }

  // Check for session_token in URL parameters (for phone camera scans)
    const urlParams = new URLSearchParams(location.search);
    const sessionToken = urlParams.get('session_token');
    console.log('AttendanceKiosk - URL sessionToken:', sessionToken, 'mode:', mode);
    if (sessionToken && mode === 'SCANNER') {
      console.log('AttendanceKiosk - Processing URL session token');
      handleQRScan(sessionToken);
    }

  // Check for pending QR session token after login
  const pendingToken = sessionStorage.getItem('pending_qr_session_token');
  console.log('AttendanceKiosk - pendingToken:', pendingToken, 'isAuthenticated:', isAuthenticated);
  if (pendingToken && isAuthenticated) {
    console.log('AttendanceKiosk - Processing pending token');
    sessionStorage.removeItem('pending_qr_session_token');
    setMode('SCANNER'); // Ensure mode is set to SCANNER for processing
    // Process the pending QR scan directly with the session token
    handlePendingQRScan(pendingToken);
  }
  }, [mode, location.search, isAuthenticated]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const processAttendance = async (
    method: 'face' | 'qr' | 'manual',
    payload: Record<string, unknown>
  ) => {
    setIsProcessing(true);

    try {
      let action: 'clock-in' | 'clock-out' = 'clock-in';

      if (method === 'face') {
        const endpoint = `/api/biometric/verify`;
        const response = await apiClient.post(endpoint, {
          faceData: payload.faceData,
          verificationMethod: 'face',
        });

        action = response.action || 'clock-in';
        setLastAction(action);
        setEmployeeName(response.employeeName || 'Employee');

        toast({
          title: 'Success!',
          description: `Successfully ${action === 'clock-in' ? 'clocked in' : 'clocked out'}`,
        });
      } else if (method === 'qr') {
        // QR scan already processed the attendance, just show success
        action = payload.action as 'clock-in' | 'clock-out' || 'clock-in';
        setLastAction(action);
        setEmployeeName(payload.employeeName as string || 'Employee');

        toast({
          title: 'Success!',
          description: `Successfully ${action === 'clock-in' ? 'clocked in' : 'clocked out'}`,
        });
      } else {
        const endpoint = `/api/biometric/attendance/${action}`;
        const response = await apiClient.post(endpoint, {
          ...payload,
          verificationMethod: 'manual',
        });

        action = response.action || action;
        setLastAction(action);
        setEmployeeName(response.employeeName || 'Employee');

        toast({
          title: 'Success!',
          description: `Successfully ${action === 'clock-in' ? 'clocked in' : 'clocked out'}`,
        });
      }

      setTimeout(() => {
        setLastAction(null);
        setEmployeeName('');
        setFaceData('');
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
        <div className="text-center text-white space-y-2">
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
              {mode === 'GENERATOR' ? 'Display QR code for employees' : 'Choose your preferred verification method'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeMethod} onValueChange={(v) => setActiveMethod(v as 'face' | 'qr' | 'qr-display' | 'manual')}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="face" className="text-base">
                  <Camera className="mr-2 h-5 w-5" />
                  Face ID
                </TabsTrigger>
                
                {mode === 'SCANNER' && (
                  <TabsTrigger value="qr" className="text-base">
                    <Scan className="mr-2 h-5 w-5" />
                    QR Code
                  </TabsTrigger>
                )}
                
                {mode === 'GENERATOR' && (
                  <TabsTrigger value="qr-display" className="text-base">
                    <QrCode className="mr-2 h-5 w-5" />
                    Show QR
                  </TabsTrigger>
                )}
                
                <TabsTrigger value="manual" className="text-base">
                  <KeyRound className="mr-2 h-5 w-5" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="face" className="space-y-6">
                <Alert><Camera className="h-4 w-4" /><AlertDescription>Position your face within the camera frame.</AlertDescription></Alert>
                {!showWebcam ? (
                  <Button onClick={() => setShowWebcam(true)} size="lg" className="w-full h-16 text-lg" disabled={isProcessing}>
                    <Camera className="mr-2 h-6 w-6" />
                    Start Face Verification
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <WebcamCapture onCapture={handleFaceCapture} isActive={showWebcam} />
                    <Button onClick={() => setShowWebcam(false)} variant="outline" className="w-full">Cancel</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="qr" className="space-y-6">
                <Alert><Scan className="h-4 w-4" /><AlertDescription>Scan the attendance QR code.</AlertDescription></Alert>
                <div className="flex justify-center"><QRCodeScanner onScan={handleQRScan} isActive={activeMethod === 'qr'} /></div>
              </TabsContent>

              <TabsContent value="qr-display" className="space-y-6">
                <Alert><QrCode className="h-4 w-4" /><AlertDescription>Display QR code for scanning.</AlertDescription></Alert>
                <div className="flex justify-center"><QRCodeDisplay /></div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-6">
                <Alert><KeyRound className="h-4 w-4" /><AlertDescription>Enter your credentials if other methods are unavailable.</AlertDescription></Alert>
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
            </Tabs>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 text-center">
                <strong>Security:</strong> AES-256 Encrypted | <strong>Audit:</strong> Fully Logged
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
