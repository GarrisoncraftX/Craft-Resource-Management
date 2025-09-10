import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WebcamCapture } from './WebcamCapture';
import { FingerprintScanner } from './FingerprintScanner';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, UserCheck, CheckCircle } from 'lucide-react';
import { mockEmployees } from '@/services/mockData';
import type { AttendancePayload, ApiResponse } from '@/types/api';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from '@/contexts/AuthContext';


export const KioskInterface: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<'attendance' | 'visitor'>('attendance');
  const [attendanceMethod, setAttendanceMethod] = useState<'face' | 'fingerprint' | 'manual'>('face');
  const [visitorMethod, setVisitorMethod] = useState<'face' | 'manual' | 'card'>('face');
  const [showWebcam, setShowWebcam] = useState(false);
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [attendanceData, setAttendanceData] = useState({
    employeeId: '',
    password: '',
  });

  const [visitorData, setVisitorData] = useState({
    name: '',
    company: '',
    purpose: '',
    employeeToVisit: '',
    cardId: '',
  });

  const [faceData, setFaceData] = useState('');
  const [fingerprintTemplate, setFingerprintTemplate] = useState('');

  const employees = mockEmployees;

  const authorizedVisitorDepartments = ['Security', 'Clerk', 'Reception'];
  const canAccessVisitorSection = user?.department && authorizedVisitorDepartments.includes(user.department);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialSectionParam = queryParams.get('initialSection');
    const navState = location.state?.initialSection;

    if (initialSectionParam === 'visitor' && canAccessVisitorSection) {
      setActiveSection('visitor');
    } else if (navState === 'visitor' && canAccessVisitorSection) {
      setActiveSection('visitor');
    } else {
      setActiveSection('attendance');
    }
  }, [location.search, location.state, canAccessVisitorSection]);


  const handleAttendanceAction = async (action: 'clock-in' | 'clock-out'): Promise<void> => {
    setIsLoading(true);
    setFeedback('');

    const createPayload = (): AttendancePayload | null => {
      if (attendanceMethod === 'face' && faceData) {
        return { faceData };
      }
      if (attendanceMethod === 'fingerprint' && fingerprintTemplate) {
        return { fingerprintId: fingerprintTemplate };
      }
      if (attendanceMethod === 'manual') {
        return {
          employeeId: attendanceData.employeeId,
          password: attendanceData.password,
        };
      }
      return null;
    };

    try {
      const payload = createPayload();
      if (!payload) {
        setFeedback('Please provide required authentication data.');
        setIsLoading(false);
        return;
      }

      const endpoint = action === 'clock-in' ? '/hr/attendance/clock-in' : '/hr/attendance/clock-out';

      const response: ApiResponse = await apiClient.post(endpoint, payload);

      if (response?.success) {
        setFeedback(`✅ Successfully ${action === 'clock-in' ? 'clocked in' : 'clocked out'} at ${new Date().toLocaleTimeString()}`);
      } else {
        setFeedback(`❌ Failed to ${action === 'clock-in' ? 'clock in' : 'clock out'}. Please try again.`);
      }

      setAttendanceData({ employeeId: '', password: '' });
      setFaceData('');
      setFingerprintTemplate('');
      setShowWebcam(false);
      setShowFingerprint(false);
    } catch (error) {
      if (error instanceof Error) {
        setFeedback(`❌ Error: ${error.message}`);
      } else {
        setFeedback('❌ Error processing attendance. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const handleVisitorAction = async (action: 'check-in' | 'check-out') => {
    setIsLoading(true);
    setFeedback('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const time = new Date().toLocaleTimeString();
      
      if (action === 'check-in') {
        setFeedback(`✅ ${visitorData.name} from ${visitorData.company} successfully checked in at ${time}`);
      } else {
        setFeedback(`✅ Visitor successfully checked out at ${time}`);
      }
      
      setVisitorData({
        name: '',
        company: '',
        purpose: '',
        employeeToVisit: '',
        cardId: '',
      });
      setFaceData('');
      setShowWebcam(false);
    } catch (error) {
      if (error instanceof Error) {
        setFeedback(`❌ Error: ${error.message}`);
      } else {
        setFeedback('❌ Error processing visitor. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const simulateCardTap = () => {
    const mockCardId = `CARD_${Date.now()}`;
    setVisitorData({...visitorData, cardId: mockCardId});
    setFeedback(`ID Card detected: ${mockCardId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/employee-dashboard')}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-900">
                System Kiosk
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            <Button
              variant={activeSection === 'attendance' ? 'default' : 'outline'}
              onClick={() => setActiveSection('attendance')}
              className="px-8 py-3"
            >
              <Clock className="h-5 w-5 mr-2" />
              Employee Attendance
            </Button>
            {canAccessVisitorSection && (
              <Button
                variant={activeSection === 'visitor' ? 'default' : 'outline'}
                onClick={() => setActiveSection('visitor')}
                className="px-8 py-3"
              >
                <Users className="h-5 w-5 mr-2" />
                Visitor Management
              </Button>
            )}
          </div>
        </div>

        {feedback && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-900 font-medium">
              {feedback}
            </AlertDescription>
          </Alert>
        )}

        {activeSection === 'attendance' && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 mr-2" />
                Employee Attendance
              </CardTitle>
              <CardDescription>
                Clock in or out using your preferred method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Select Authentication Method
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant={attendanceMethod === 'face' ? 'default' : 'outline'}
                      onClick={() => {
                        setAttendanceMethod('face');
                        setShowWebcam(true);
                        setShowFingerprint(false);
                      }}
                    >
                      Face ID
                    </Button>
                    <Button
                      variant={attendanceMethod === 'fingerprint' ? 'default' : 'outline'}
                      onClick={() => {
                        setAttendanceMethod('fingerprint');
                        setShowFingerprint(true);
                        setShowWebcam(false);
                      }}
                    >
                      Fingerprint
                    </Button>
                    <Button
                      variant={attendanceMethod === 'manual' ? 'default' : 'outline'}
                      onClick={() => {
                        setAttendanceMethod('manual');
                        setShowWebcam(false);
                        setShowFingerprint(false);
                      }}
                    >
                      Manual Entry
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {attendanceMethod === 'face' && (
                      <div>
                        <WebcamCapture
                          onCapture={setFaceData}
                          isActive={showWebcam}
                        />
                        {faceData && (
                          <div className="text-center mt-2">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Face Captured
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {attendanceMethod === 'fingerprint' && (
                      <div>
                        <FingerprintScanner
                          onCapture={setFingerprintTemplate}
                          isActive={showFingerprint}
                        />
                      </div>
                    )}

                    {attendanceMethod === 'manual' && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="empId">Employee ID</Label>
                          <Input
                            id="empId"
                            type="text"
                            value={attendanceData.employeeId}
                            onChange={(e) => setAttendanceData({...attendanceData, employeeId: e.target.value})}
                            placeholder="Enter your Employee ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor="empPassword">Password</Label>
                          <Input
                            id="empPassword"
                            type="password"
                            value={attendanceData.password}
                            onChange={(e) => setAttendanceData({...attendanceData, password: e.target.value})}
                            placeholder="Enter your password"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center space-y-4">
                    <Button
                      onClick={() => handleAttendanceAction('clock-in')}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white h-16 text-lg"
                    >
                      {isLoading ? 'Processing...' : 'CLOCK IN'}
                    </Button>
                    <Button
                      onClick={() => handleAttendanceAction('clock-out')}
                      disabled={isLoading}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 h-16 text-lg"
                    >
                      {isLoading ? 'Processing...' : 'CLOCK OUT'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'visitor' && canAccessVisitorSection && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <Users className="h-6 w-6 mr-2" />
                Visitor Management
              </CardTitle>
              <CardDescription>
                Check in or out visitors to the facility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Select Check-in Method
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant={visitorMethod === 'face' ? 'default' : 'outline'}
                      onClick={() => {
                        setVisitorMethod('face');
                        setShowWebcam(true);
                      }}
                    >
                      Face ID
                    </Button>
                    <Button
                      variant={visitorMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => {
                        setVisitorMethod('card');
                        setShowWebcam(false);
                      }}
                    >
                      ID Card Tap
                    </Button>
                    <Button
                      variant={visitorMethod === 'manual' ? 'default' : 'outline'}
                      onClick={() => {
                        setVisitorMethod('manual');
                        setShowWebcam(false);
                      }}
                    >
                      Manual Entry
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="visitorName">Visitor Name</Label>
                        <Input
                          id="visitorName"
                          type="text"
                          value={visitorData.name}
                          onChange={(e) => setVisitorData({...visitorData, name: e.target.value})}
                          placeholder="Enter visitor's full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company/Organization</Label>
                        <Input
                          id="company"
                          type="text"
                          value={visitorData.company}
                          onChange={(e) => setVisitorData({...visitorData, company: e.target.value})}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purpose">Purpose of Visit</Label>
                        <Input
                          id="purpose"
                          type="text"
                          value={visitorData.purpose}
                          onChange={(e) => setVisitorData({...visitorData, purpose: e.target.value})}
                          placeholder="Meeting, delivery, consultation, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="employeeToVisit">Employee to Visit</Label>
                          <Select onValueChange={(value) => setVisitorData({...visitorData, employeeToVisit: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.toString()} value={employee.toString()}>
                              {employee.toString()}
                            </SelectItem>
                          ))}
                            </SelectContent>
                          </Select>
                      </div>
                    </div>

                    {visitorMethod === 'face' && (
                      <div>
                        <WebcamCapture
                          onCapture={setFaceData}
                          isActive={showWebcam}
                        />
                        {faceData && (
                          <div className="text-center mt-2">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Face Captured
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {visitorMethod === 'card' && (
                      <div className="text-center space-y-4">
                        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                          <p className="text-gray-600 mb-4">Tap your ID card on the reader</p>
                          <Button onClick={simulateCardTap} variant="outline">
                            Simulate Card Tap
                          </Button>
                        </div>
                        {visitorData.cardId && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Card ID: {visitorData.cardId}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center space-y-4">
                    <Button
                      onClick={() => handleVisitorAction('check-in')}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-16 text-lg"
                    >
                      {isLoading ? 'Processing...' : 'CHECK IN VISITOR'}
                    </Button>
                    <Button
                      onClick={() => handleVisitorAction('check-out')}
                      disabled={isLoading}
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50 h-16 text-lg"
                    >
                      {isLoading ? 'Processing...' : 'CHECK OUT VISITOR'}
                    </Button>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Currently Checked In</h3>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Alice Johnson</span>
                          <span className="text-gray-500">TechCorp</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bob Martinez</span>
                          <span className="text-gray-500">City Planning</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carol Davis</span>
                          <span className="text-gray-500">Legal Firm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};