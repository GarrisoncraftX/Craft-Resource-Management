import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Ensure these components are available in your project setup
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { Button } from '@/components/ui/button'; 
import { Label } from '@/components/ui/label'; 
import { useNavigate } from 'react-router-dom';
import { Employee, fetchEmployeeById } from '@/services/api'; 
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/Navbar';
import { Briefcase, Mail, MapPin, Shield, DollarSign, FileText, User } from 'lucide-react'; 

// --- Helper Component ---
const InfoField: React.FC<{ label: string; value: string | number | undefined | null }> = ({ label, value }) => (
    <div className="py-3 px-1 border-b border-gray-100 last:border-b-0">
        <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</Label>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">
            {value ? (typeof value === 'number' ? value.toLocaleString() : value) : 'N/A'}
        </p>
    </div>
);

const EmployeeInfoDisplay: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // --- State Management ---
    const [employeeData, setEmployeeData] = useState<Employee | null>(user ? {
        id: user.userId, tenantId: 0, employeeId: user.employeeId, email: user.email,
        firstName: user.firstName, lastName: user.lastName, middleName: '', phone: '',
        address: '', dateOfBirth: '', hireDate: '', departmentId: user.departmentId,
        roleId: user.roleId, managerId: '', salary: 0, isActive: 1,
        biometricEnrollmentStatus: '', lastLogin: '', failedLoginAttempts: 0,
        accountLockedUntil: '', passwordResetToken: '', passwordResetExpires: '',
        createdAt: '', updatedAt: '', dateOfJoining: '',
        accountNumber: '', momoNumber: '', profilePictureUrl: '', emergencyContactName: '',
        emergencyContactPhone: '', role: user.role, department: user.department,
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
                    setEmployeeData({ ...employee, department: user.department, role: user.role });
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

    // --- Conditional Renderings (kept as is) ---
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-xl text-gray-600">Loading employee information...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg">
                    <p className="text-xl text-red-600 mb-6">{error}</p>
                    <Button onClick={() => navigate('/signin')}>Go to Sign In</Button>
                </div>
            </div>
        );
    }

    if (!employeeData) {
        return <div className="flex items-center justify-center min-h-screen text-xl text-gray-600">No employee data available.</div>;
    }

    // --- Handlers (kept as is) ---
    const handleEditClick = () => { navigate('/employee/account'); };
    const handleViewDashboard = () => { navigate('/employee-dashboard'); };
    const handleLogout = () => { logout(); navigate('/signin'); };
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString.split('T')[0]).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return dateString.split('T')[0] || 'N/A';
        }
    };

    // --- Main Component Render ---
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar
                title="Employee Profile"
                onViewDashboard={handleViewDashboard}
                onLogout={handleLogout}
                toggleSidebar={() => {}}
                isEmployeeDashboard={true}
            />
            <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
                
                {/* 1. Profile Header Card (Styled) */}
                <Card className="shadow-xl mb-8 border-t-4 border-blue-600 rounded-lg overflow-hidden">
                    <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8 bg-white">
                        <Avatar className="h-28 w-28 cursor-pointer ring-4 ring-blue-100/50 hover:ring-blue-200 transition-all" onClick={handleEditClick}>
                            {employeeData.profilePictureUrl ? (
                                <AvatarImage src={employeeData.profilePictureUrl} alt={`${employeeData.firstName} ${employeeData.lastName}`} />
                            ) : (
                                <AvatarFallback className="text-5xl font-extrabold bg-blue-600 text-white">
                                    {employeeData.firstName?.charAt(0)}{employeeData.lastName?.charAt(0)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="text-center sm:text-left">
                            <button
                                className="text-3xl md:text-4xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors leading-tight"
                                onClick={handleEditClick}
                            >
                                {employeeData.firstName} {employeeData.lastName}
                            </button>
                             <p className="text-xl text-blue-700 font-semibold mt-1 flex items-center justify-center sm:justify-start">
                                <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                                {employeeData.department || 'Department N/A'}
                            </p>
                            <p className="text-xl text-blue-700 font-semibold mt-1 flex items-center justify-center sm:justify-start">
                                <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                               Position: {employeeData.role || 'Role N/A'}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Employee ID: **{employeeData.employeeId}**</p>
                        </div>
                        <div className="sm:ml-auto pt-4 sm:pt-0">
                            <Button variant="outline" size="lg" onClick={handleEditClick}>Edit Account Details</Button>
                        </div>
                    </CardContent>
                </Card>
                
                {/* 2. Main Content Area: Tabs Structure (FIXED) */}
                <Tabs 
                    value={selectedTab} 
                    onValueChange={setSelectedTab}
                    className="flex flex-col md:flex-row gap-6"
                >
                    {/* Left Column: Tabs List (Sidebar Style) */}
                    <TabsList 
                        className="flex flex-row md:flex-col space-y-1 bg-white p-3 rounded-lg shadow-md h-fit md:h-full sticky top-28 border border-gray-200 overflow-x-auto md:overflow-x-visible w-full md:w-64 shrink-0"
                    >
                        <TabsTrigger value="profile" className="justify-start py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-semibold transition-colors rounded-md">
                            <User className="w-4 h-4 mr-3" /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="jobDetails" className="justify-start py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-semibold transition-colors rounded-md">
                            <Briefcase className="w-4 h-4 mr-3" /> Job Details
                        </TabsTrigger>
                        <TabsTrigger value="payroll" className="justify-start py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-semibold transition-colors rounded-md">
                            <DollarSign className="w-4 h-4 mr-3" /> Payroll & Payments
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="justify-start py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-semibold transition-colors rounded-md">
                            <FileText className="w-4 h-4 mr-3" /> Documents
                        </TabsTrigger>
                    </TabsList>

                    {/* Right Column: Tab Content Container (must be INSIDE Tabs) */}
                    <div className="flex-1">
                        
                        {/* PROFILE TAB CONTENT */}
                        <TabsContent value="profile" className="mt-0">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Personal Profile</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                <Card className="shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                                    <CardHeader className="border-b p-4 bg-gray-50/50">
                                        <CardTitle className="text-lg font-bold text-gray-700 flex items-center">
                                            <Shield className="w-5 h-5 mr-2 text-blue-500" /> Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 grid grid-cols-1">
                                        <InfoField label="First Name" value={employeeData.firstName} />
                                        <InfoField label="Last Name" value={employeeData.lastName} />
                                        <InfoField label="Date of Birth" value={formatDate(employeeData.dateOfBirth)} />
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                                    <CardHeader className="border-b p-4 bg-gray-50/50">
                                        <CardTitle className="text-lg font-bold text-gray-700 flex items-center">
                                            <Mail className="w-5 h-5 mr-2 text-blue-500" /> Contact Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 grid grid-cols-1">
                                        <InfoField label="Email" value={employeeData.email} />
                                        <InfoField label="Phone" value={employeeData.phone} />
                                        <InfoField label="Address" value={employeeData.address} />
                                    </CardContent>
                                </Card>

                                <div className="lg:col-span-2">
                                    <Card className="shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                                        <CardHeader className="border-b p-4 bg-gray-50/50">
                                            <CardTitle className="text-lg font-bold text-gray-700 flex items-center">
                                                <MapPin className="w-5 h-5 mr-2 text-red-500" /> Emergency Contact
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                            <InfoField label="Contact Name" value={employeeData.emergencyContactName} />
                                            <InfoField label="Contact Phone" value={employeeData.emergencyContactPhone} />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* JOB DETAILS TAB CONTENT */}
                        <TabsContent value="jobDetails" className="mt-0">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Job Details</h2>
                            <Card className="shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                                <CardHeader className="border-b p-4 bg-gray-50/50">
                                    <CardTitle className="text-lg font-bold text-gray-700 flex items-center">
                                        <Briefcase className="w-5 h-5 mr-2 text-blue-500" /> Employment Record
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <InfoField label="EmployeeID Number" value={employeeData.employeeId} />
                                    <InfoField label="Department" value={employeeData.department} />
                                    <InfoField label="Role/Title" value={employeeData.role} />
                                    <InfoField label="Hire Date" value={formatDate(employeeData.hireDate)} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* PAYROLL TAB CONTENT */}
                        <TabsContent value="payroll" className="mt-0">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Payroll & Payments</h2>
                            <Card className="shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                                <CardHeader className="border-b p-4 bg-gray-50/50">
                                    <CardTitle className="text-lg font-bold text-gray-700 flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2 text-green-600" /> Financial & Payment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <InfoField label="Bank Account Number" value={employeeData.accountNumber} />
                                    <InfoField label="Mobile Money Number" value={employeeData.momoNumber} />
                                    <InfoField label="Annual Salary (Estimated)" value={employeeData.salary ? `$${employeeData.salary.toLocaleString()}` : 'N/A'} />
                                    <InfoField label="Last Pay Date" value={formatDate(employeeData.lastLogin) || 'N/A'} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* DOCUMENTS TAB CONTENT */}
                        <TabsContent value="documents" className="mt-0">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Documents</h2>
                            <Card className="shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                                <CardHeader className="border-b p-4 bg-gray-50/50">
                                    <CardTitle className="text-lg font-bold text-gray-700 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-purple-600" /> Document Repository
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 text-gray-600">
                                    <p className="font-semibold mb-2">Secure Document Access</p>
                                    <p className="text-sm text-gray-500">This section is reserved for the secure display and management of personal and employment documents, such as contracts, pay slips, and identification copies.</p>
                                    <Button variant="secondary" className="mt-4">View All Documents</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div> 
                </Tabs>

            </div>
        </div>
    );
};

export default EmployeeInfoDisplay;