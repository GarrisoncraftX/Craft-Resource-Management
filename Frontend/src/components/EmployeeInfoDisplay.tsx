import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Employee, fetchEmployeeById } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/Navbar';

const EmployeeInfoDisplay: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const employeeNumber = user?.employeeNumber || null;

  const [employeeData, setEmployeeData] = useState<Employee | null>(user ? {
    id: user.userId,
    tenantId: 0,
    employeeId: user.employeeId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    hireDate: '',
    departmentId: user.departmentId,
    roleId: user.roleId,
    managerId: '',
    salary: 0,
    isActive: 1,
    biometricEnrollmentStatus: '',
    lastLogin: '',
    failedLoginAttempts: 0,
    accountLockedUntil: '',
    passwordResetToken: '',
    passwordResetExpires: '',
    createdAt: '',
    updatedAt: '',
    dateOfJoining: '',
    employeeNumber: user.employeeNumber,
    accountNumber: '',
    momoNumber: '',
    profilePictureUrl: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    role: user.role,
    department: user.department,
  } : null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('profile');

  useEffect(() => {
    if (user?.userId) {
      setLoading(true);
      setError(null);
      fetchEmployeeById(user.userId)
        .then((employee) => {
          setEmployeeData(employee);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load employee information:', error);
          setError('Failed to load employee information. Please try again later.');
          setLoading(false);
        });
    } else {
      setError('User ID not found. Please log in again.');
      setLoading(false);
    }
  }, [user?.userId]);

  if (loading) {
    return <div>Loading employee information...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return <div>No employee data available.</div>;
  }

  const handleEditClick = () => {
    navigate('/employee/account');
  };

  const handleViewDashboard = () => {
    navigate('/employee-dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Employee Info"
        onViewDashboard={handleViewDashboard}
        onLogout={handleLogout}
        toggleSidebar={() => {}}
        isEmployeeDashboard={true}
      />
      <div className="pt-20">
        {/* Header with profile picture and name */}
        <div className="bg-green-400 flex items-center gap-4 px-6 py-4">
          <Avatar className="h-20 w-20 cursor-pointer" onClick={handleEditClick}>
            {employeeData.profilePictureUrl ? (
              <AvatarImage src={employeeData.profilePictureUrl} />
            ) : (
              <AvatarFallback className="text-3xl">
                {employeeData.firstName?.charAt(0)}{employeeData.lastName?.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <h1
            className="text-white text-3xl font-semibold cursor-pointer"
            onClick={handleEditClick}
          >
            {employeeData.firstName} {employeeData.lastName}
          </h1>
        </div>

        <div className="flex max-w-6xl mx-auto mt-6 px-6 gap-6">
        {/* Left Tabs */}
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-48"
        >
          <TabsList className="flex flex-col space-y-2 border rounded-md p-2">
            <TabsTrigger value="profile" className="text-left">
              Profile
            </TabsTrigger>
            <TabsTrigger value="jobDetails" className="text-left">
              Job Details
            </TabsTrigger>
            <TabsTrigger value="payroll" className="text-left">
              Payroll
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-left">
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Right Content */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <CardHeader>
                    <CardTitle>Basics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>First Name:</strong> {employeeData.firstName}</p>
                    <p><strong>Last Name:</strong> {employeeData.lastName}</p>
                    <p><strong>Date of Birth:</strong> {employeeData.dateOfBirth?.split('T')[0]}</p>
                  </CardContent>
                </Card>

                <Card className="p-4">
                  <CardHeader>
                    <CardTitle>Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Email:</strong> {employeeData.email}</p>
                    <p><strong>Phone:</strong> {employeeData.phone}</p>
                  </CardContent>
                </Card>

                <Card className="p-4">
                  <CardHeader>
                    <CardTitle>Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{employeeData.address}</p>
                  </CardContent>
                </Card>

                <Card className="p-4">
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Name:</strong> {employeeData.emergencyContactName || 'N/A'}</p>
                    <p><strong>Phone:</strong> {employeeData.emergencyContactPhone || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="jobDetails">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Role:</strong> {employeeData.role || 'N/A'}</p>
                  <p><strong>Department:</strong> {employeeData.department || 'N/A'}</p>
                  <p><strong>Hire Date:</strong> {employeeData.hireDate?.split('T')[0] || 'N/A'}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Payroll</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Bank Account:</strong> {employeeData.accountNumber || 'N/A'}</p>
                  <p><strong>Mobile Money:</strong> {employeeData.momoNumber || 'N/A'}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Document list or upload functionality can be added here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      </div>
    </div>
  );
};

export default EmployeeInfoDisplay;
