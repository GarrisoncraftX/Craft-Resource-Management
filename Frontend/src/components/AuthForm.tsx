/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { WebcamCapture } from './WebcamCapture';
import { PasswordResetDialog } from './modules/admin/PasswordResetDialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/utils/apiClient';
import { Eye, EyeOff, AlertCircle, CheckCircle} from 'lucide-react';
import { ClockInSuccessModal } from './ClockInSuccessModal';


const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Biometric states
  const [showWebcam, setShowWebcam] = useState(false);
  const [faceData, setFaceData] = useState('');

  // Modal states
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [clockInData, setClockInData] = useState<{
    employeeData: any;
    clockInTime: string;
    clockInMethod: string;
  } | null>(null);

  // Form states
  const [signinData, setSigninData] = useState({
    employeeId: '',
    password: '',
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const sessionToken = urlParams.get('session_token');
    if (sessionToken && !isAuthenticated) {
      sessionStorage.setItem('pending_qr_session_token', sessionToken);
      globalThis.history.replaceState({}, '', globalThis.location.pathname);
    }
  }, [isAuthenticated]);

 
  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let payload: any = {};

      if (faceData) {
        payload = { biometric_type: 'face', raw_data: faceData };
      } else {
        // Standard username/password login
        payload = {
          employeeId: signinData.employeeId,
          password: signinData.password,
        };
      }

      const response = await apiClient.post('/api/auth/signin', payload);
      // Extract token string from response.token object if needed
      const token = typeof response.token === 'string' ? response.token : (response.token?.token ?? '');

      const userData = response.user ?? {
        user_id: '',
        department_id: 0,
        role_id: 0,
        permissions: [],
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        role: '',
      };

      login(userData, token);

      console.log('User data after login:', userData);
      console.log('defaultPasswordChanged:', userData.defaultPasswordChanged);
      console.log('profileCompleted:', userData.profileCompleted);

      // Check if there's a pending QR session token to process
      const pendingToken = sessionStorage.getItem('pending_qr_session_token');
      if (pendingToken) {
        // Process attendance directly after login
        try {
          const attendanceResponse = await apiClient.post('/api/biometric/attendance/qr-scan', {
            session_token: pendingToken,
          });

          if (attendanceResponse.success) {
            // Show modal for successful clock-in
            if (attendanceResponse.action === 'clock_in') {
              setClockInData({
                employeeData: {
                  employeeId: userData.user_id || signinData.employeeId,
                  firstName: userData.firstName || '',
                  lastName: userData.lastName || '',
                  email: userData.email || '',
                  department: userData.department || '',
                  role: userData.role || '',
                },
                clockInTime: attendanceResponse.clock_in_time || new Date().toISOString(),
                clockInMethod: attendanceResponse.clock_in_method || 'QR Code',
              });
              setShowClockInModal(true);
            } else {
              setSuccess(`Successfully signed in and ${attendanceResponse.action.replace('_', ' ')}!`);
              setTimeout(() => navigate('/employee-dashboard'), 2000);
            }
            sessionStorage.removeItem('pending_qr_session_token');
          } else {
            setError(attendanceResponse.message || 'Failed to process attendance');
            sessionStorage.removeItem('pending_qr_session_token');
          }
        } catch (attendanceError) {
          console.error('Error processing pending QR attendance:', attendanceError);
          setError('Successfully signed in, but failed to process attendance. Please try again.');
          sessionStorage.removeItem('pending_qr_session_token');
        }
      } else {
        // Check if user needs to complete profile setup
        const needsPasswordChange = userData.defaultPasswordChanged === false;
        const needsProfileCompletion = userData.profileCompleted === false;
        
        console.log('needsPasswordChange:', needsPasswordChange);
        console.log('needsProfileCompletion:', needsProfileCompletion);
        
        if (needsPasswordChange || needsProfileCompletion) {
          setSuccess('Please complete your profile setup.');
          setTimeout(() => navigate('/employee/account'), 1000);
        } else {
          setSuccess('Successfully signed in!');
          setTimeout(() => navigate('/employee-dashboard'), 1000);
        }
      }

    } catch (err) {
      setError(err.message ?? 'Invalid credentials. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">
            CraftResourceManagement
          </CardTitle>
          <CardDescription>
            Secure access to your government resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Feedback Messages */}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignin} className="space-y-4">
                <div>
                  <Label htmlFor="signin-employeeId">Employee ID</Label>
                  <Input
                    id="signin-employeeId"
                    type="text"
                    value={signinData.employeeId}
                    onChange={(e) => setSigninData({ ...signinData, employeeId: e.target.value })}
                    placeholder="Enter your Employee ID"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signinData.password}
                      onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Biometric Options for Sign In */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowWebcam(!showWebcam);
                      }}
                    >
                      {showWebcam ? 'Hide' : 'Use'} Face ID
                    </Button>
                  </div>

                  {showWebcam && (
                    <div>
                      <WebcamCapture onCapture={setFaceData} isActive={showWebcam} />
                      {faceData && (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Face Captured
                        </Badge>
                      )}
                    </div>
                  )}


                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setResetDialogOpen(true)}
                >
                  Forgot Password?
                </Button>
          </form>
        </CardContent>
      </Card>

      {/* Clock In Success Modal */}
      {clockInData && (
        <ClockInSuccessModal
          isOpen={showClockInModal}
          onClose={() => {
            setShowClockInModal(false);
            setClockInData(null);
            navigate('/employee-dashboard');
          }}
          employeeData={clockInData.employeeData}
          clockInTime={clockInData.clockInTime}
          clockInMethod={clockInData.clockInMethod}
        />
      )}

      <PasswordResetDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen} />
    </div>
  );
};

export default AuthForm;