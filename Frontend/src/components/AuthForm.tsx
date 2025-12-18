/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { WebcamCapture } from './WebcamCapture';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/utils/apiClient';
import { Eye, EyeOff, AlertCircle, CheckCircle} from 'lucide-react';
import { mockDepartments, mockRoles } from '@/services/mockData';
import type { Department, Role} from '@/types/api';


const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
  const [newlyRegisteredUserId, setNewlyRegisteredUserId] = useState<string | null>(null);

  // Biometric states
  const [showWebcam, setShowWebcam] = useState(false);
  const [faceData, setFaceData] = useState('');

  // Form states
  const [signinData, setSigninData] = useState({
    employeeId: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: 0,
    roleId: 0,
    nationalId: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
  });

  // Dynamic data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [isRolesLoading, setIsRolesLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  // Check for session_token in URL and store as pending if not authenticated
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('session_token');
    if (sessionToken && !isAuthenticated) {
      sessionStorage.setItem('pending_qr_session_token', sessionToken);
      // Remove session_token from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [isAuthenticated]);

  // Fetch departments and roles from API
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsDepartmentsLoading(true);
      try {
        const response = await apiClient.get('/api/lookup/departments');
        console.log('Fetched departments:', response);

        if (response?.length > 0) {
          setDepartments(response);
        } else {
          setDepartments(mockDepartments);
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
          setDepartments(mockDepartments);
      } finally {
        setIsDepartmentsLoading(false);
      }
    };

    const fetchRoles = async () => {
      setIsRolesLoading(true);
      try {
        const response = await apiClient.get('/api/lookup/roles');
          console.log('Fetched roles:', response);

        if (response?.length > 0) {
          setRoles(response);
        } else {
          setRoles(mockRoles);
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
          setRoles(mockRoles);
      } finally {
        setIsRolesLoading(false);
      }
    };

    fetchDepartments();
    fetchRoles();
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

      // Check if there's a pending QR session token to process
      const pendingToken = sessionStorage.getItem('pending_qr_session_token');
      if (pendingToken) {
        navigate(`/kiosk-interface?session_token=${pendingToken}`);
        sessionStorage.removeItem('pending_qr_session_token');
      } else {
        setSuccess('Successfully signed in!');
        setTimeout(() => navigate('/employee-dashboard'), 1000);
      }

    } catch (err) {
      setError(err.message ?? 'Invalid credentials. Please try again.');
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        employeeId: registerData.employeeId,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        middleName: registerData.middleName,
        email: registerData.email,
        password: registerData.password,
        departmentId: registerData.departmentId,
        roleId: registerData.roleId,
        nationalId: registerData.nationalId,
        phoneNumber: registerData.phoneNumber,
        address: registerData.address,
        dateOfBirth: registerData.dateOfBirth,
      };

      // Add biometric data if captured during registration
      if (faceData) {
        payload.biometric_type_face = 'face';
        payload.raw_data_face = faceData;
      }

      const response = await apiClient.post('/api/auth/register', payload);

      if (response && response.id) {
        setRegistrationSuccessful(true);
        setNewlyRegisteredUserId(response.id);
        setSuccess('Registration successful! Please proceed to enroll your biometrics.');
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }

      setRegisterData({
        employeeId: '',
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: '',
        confirmPassword: '',
        departmentId: 0,
        roleId: 0,
        nationalId: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
      });
      setFaceData(''); 
      setShowWebcam(false);
    } catch (err) {
      setError(err.message ?? 'Registration failed. Please try again.');
    }

    setIsLoading(false);
  };



  const handleBiometricEnrollmentComplete = () => {
    setSuccess('Biometric enrollment complete! You can now sign in.');
    setActiveTab('signin');
    setRegistrationSuccessful(false); 
    setNewlyRegisteredUserId(null); 
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4">
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
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-4">
              {!registrationSuccessful ? (
                <form onSubmit={handleRegister} className="space-y-4">
              
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        type="text"
                        value={registerData.middleName}
                        onChange={(e) => setRegisterData({ ...registerData, middleName: e.target.value })}
                        placeholder="Middle name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-employeeId">Employee ID *</Label>
                    <Input
                      id="register-employeeId"
                      type="text"
                      value={registerData.employeeId}
                      onChange={(e) => setRegisterData({ ...registerData, employeeId: e.target.value })}
                      placeholder="Enter Employee ID"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nationalId">National ID</Label>
                      <Input
                        id="nationalId"
                        type="text"
                        value={registerData.nationalId}
                        onChange={(e) => setRegisterData({ ...registerData, nationalId: e.target.value })}
                        placeholder="National ID number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={registerData.phoneNumber}
                        onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      value={registerData.address}
                      onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={registerData.dateOfBirth}
                      onChange={(e) => setRegisterData({ ...registerData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={registerData.departmentId?.toString()}
                        onValueChange={(value) => setRegisterData({ ...registerData, departmentId: Number(value) })}
                        disabled={isDepartmentsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={isDepartmentsLoading ? "Loading departments..." : "Select department"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={registerData.roleId?.toString()}
                        onValueChange={(value) => setRegisterData({ ...registerData, roleId: Number(value) })}
                        disabled={isRolesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={isRolesLoading ? "Loading roles..." : "Select role"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="Create a password"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  {/* Biometric Options for Registration */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Optional: Enroll Biometrics During Registration</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowWebcam(!showWebcam)}
                      >
                        {showWebcam ? 'Hide' : 'Capture'} Face
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
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <h3 className="text-xl font-semibold text-green-700">Registration Complete!</h3>
                  <p className="text-gray-600">Now, let's enroll your biometrics for secure access.</p>

                  {/* Biometric Enrollment Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Biometric Enrollment</Label>
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowWebcam(!showWebcam);
                        }}
                      >
                        {showWebcam ? 'Hide' : 'Capture'} Face
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
                    onClick={handleBiometricEnrollmentComplete}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Finish & Go to Sign In
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;