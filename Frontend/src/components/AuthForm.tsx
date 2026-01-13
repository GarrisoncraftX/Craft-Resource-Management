/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordResetDialog } from './modules/admin/PasswordResetDialog';
import { useAuth } from '@/contexts/AuthContext';
import { authApiService } from '@/services/api';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { ClockInSuccessModal } from './ClockInSuccessModal';
import bgImage from '../../assets/bgimage.jpg';
import logo from '../../assets/logo.png';


const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);


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
         payload = {
          employeeId: signinData.employeeId,
          password: signinData.password,
        };
      
      const response = await authApiService.signin(payload);
      // Extract token string from response.token object if needed
      const token = typeof response.token === 'string' ? response.token : (response.token as any)?.token ?? '';

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
        defaultPasswordChanged: false,
        profileCompleted: false
      };

      login(userData as any, token);

      console.log('User data after login:', userData);
      console.log('defaultPasswordChanged:', userData.defaultPasswordChanged);
      console.log('profileCompleted:', userData.profileCompleted);

      // Check if there's a pending QR session token to process
      const pendingToken = sessionStorage.getItem('pending_qr_session_token');
      if (pendingToken) {
        // Process attendance directly after login
        try {
          const attendanceResponse = await authApiService.processQRAttendance(pendingToken);

          if (attendanceResponse.success) {
            // Show modal for successful clock-in
            if (attendanceResponse.action === 'clock_in') {
              setClockInData({
                employeeData: {
                  employeeId: (userData as any).user_id || signinData.employeeId,
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
        const needsPasswordChange = (userData as any).defaultPasswordChanged === false;
        const needsProfileCompletion = (userData as any).profileCompleted === false;
        
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
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-8 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-background/5" />
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-0 items-stretch">
          {/* Left side - Welcome section */}
          <Card className="flex-1 rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none border-0 shadow-2xl bg-primary/95 backdrop-blur-md">
            <CardContent className="flex flex-col items-center justify-center p-8 lg:p-12 h-full">
              <div className="text-center space-y-6">
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground">
                    Welcome Back
                  </h1>
                  <p className="text-primary-foreground/90 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                    Craft Resource Management System
                  </p>
                  <p className="text-primary-foreground/70 text-sm max-w-sm mx-auto">
                    Your comprehensive solution for efficient government resource management
                  </p>
                </div>
                <div className="pt-6 space-y-4">
                  <div className="flex flex-col gap-4 text-sm text-primary-foreground/80">
                    <div className="flex items-center gap-3">
                      <div className="bg-background/10 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="text-left">Secure & Reliable Access</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-background/10 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="text-left">Integrated Resource Management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-background/10 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="text-left">Real-time Monitoring & Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right side - Sign in form */}
          <Card className="flex-1 rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none border-0 shadow-2xl bg-card/95 backdrop-blur-md">
            <CardHeader className="text-center pb-2 pt-8">
               <div className="flex justify-center">
                    <img 
                      src={logo} 
                      alt="Craft Logo" 
                      className="h-40 w-40 md:h-24 md:w-24 object-contain drop-shadow-2xl rounded-full"
                    />
                </div>
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
                Sign In
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {/* Feedback Messages */}
              {error && (
                <Alert className="mb-4 border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSignin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-employeeId" className="text-foreground font-medium">Employee ID</Label>
                  <Input
                    id="signin-employeeId"
                    type="text"
                    value={signinData.employeeId}
                    onChange={(e) => setSigninData({ ...signinData, employeeId: e.target.value })}
                    placeholder="Enter your Employee ID"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signinData.password}
                      onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="h-11 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="w-full text-primary hover:text-primary/80"
                  onClick={() => setResetDialogOpen(true)}
                >
                  Forgot Password?
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

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