import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/ui/Navbar';
import { useNavigate } from 'react-router-dom';
import { fetchEmployeeById, updateEmployeeById, uploadProfilePicture } from '@/services/api';

export const EmployeeAccount: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    password: '',
    confirmPassword: '',
  });

  const [bankingInfo, setBankingInfo] = useState({
    accountNumber: '',
    bankName: '',
    momoNumber: '',
    momoProvider: '',
  });

  useEffect(() => {
    if (user?.userId) {
      fetchEmployeeById(user.userId)
        .then((employee) => {
          setPersonalInfo({
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            middleName: employee.middleName || '',
            email: employee.email || '',
            phone: employee.phone || '',
            address: employee.address || '',
            dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
            emergencyContactName: employee.emergencyContactName || '',
            emergencyContactPhone: employee.emergencyContactPhone || '',
            password: '',
            confirmPassword: '',
          });
          setBankingInfo({
            accountNumber: employee.accountNumber || '',
            bankName: '',
            momoNumber: employee.momoNumber || '',
            momoProvider: '',
          });
          setProfileImage(employee.profilePictureUrl || '');
        })
        .catch((error) => {
          console.error('Failed to load employee information:', error);
          toast.error('Failed to load employee information');
        });
    }
  }, [user?.userId]);

  const handleSavePersonalInfo = async () => {
    if (!user?.userId) {
      toast.error('User ID is missing');
      return;
    }
    if (personalInfo.password && personalInfo.password !== personalInfo.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const updateRequest = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        middleName: personalInfo.middleName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        address: personalInfo.address,
        dateOfBirth: personalInfo.dateOfBirth,
        emergencyContactName: personalInfo.emergencyContactName,
        emergencyContactPhone: personalInfo.emergencyContactPhone,
        accountNumber: bankingInfo.accountNumber,
        momoNumber: bankingInfo.momoNumber,
        password: personalInfo.password || undefined,
        confirmPassword: personalInfo.confirmPassword || undefined,
        profileCompleted: true,
        defaultPasswordChanged: personalInfo.password ? true : undefined,
      };
      await updateEmployeeById(user.userId, updateRequest);
      toast.success('Personal information updated successfully');
      
      // Redirect to dashboard after successful profile completion
      if (updateRequest.profileCompleted) {
        setTimeout(() => navigate('/employee-dashboard'), 1500);
      }
    } catch (error) {
      console.error('Failed to update personal information:', error);
      toast.error('Failed to update personal information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankingInfo = async () => {
    if (!user?.userId) {
      toast.error('User ID is missing');
      return;
    }
    setLoading(true);
    try {
      const updateRequest = {
        accountNumber: bankingInfo.accountNumber,
        momoNumber: bankingInfo.momoNumber,
      };
      await updateEmployeeById(user.userId, updateRequest);
      toast.success('Banking information updated successfully');
    } catch (error) {
      toast.error('Failed to update banking information');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDashboard = () => {
    navigate('/employee-dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBankingInfoChange = (field: string, value: string) => {
    setBankingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user?.userId) {
      setLoading(true);
      try {
        const updatedEmployee = await uploadProfilePicture(user.userId, file);
        setProfileImage(updatedEmployee.profilePictureUrl || '');
        toast.success('Profile picture updated successfully');
      } catch (error) {
        console.error('Failed to upload profile picture:', error);
        toast.error('Failed to upload profile picture');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        title="Employee Account" 
        onViewDashboard={handleViewDashboard}
        onLogout={handleLogout}
        toggleSidebar={() => {}}
        isEmployeeDashboard={true}
      />
      
      <div className="pt-20 px-6 pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileImage} />
                <AvatarFallback className="text-2xl">
                  {personalInfo.firstName.charAt(0)}{personalInfo.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Label htmlFor="picture">
                  <Button variant="outline" asChild>
                    <span className="flex items-center gap-2 cursor-pointer">
                      <Camera className="h-4 w-4" />
                      Upload Photo
                    </span>
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Account Information Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your personal and banking details</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="banking">Banking Details</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={personalInfo.firstName}
                        onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={personalInfo.lastName}
                        onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        value={personalInfo.middleName}
                        onChange={(e) => handlePersonalInfoChange('middleName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={personalInfo.address}
                        onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={personalInfo.emergencyContactName}
                        onChange={(e) => handlePersonalInfoChange('emergencyContactName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={personalInfo.emergencyContactPhone}
                        onChange={(e) => handlePersonalInfoChange('emergencyContactPhone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                      <Input
                        id="password"
                        type="password"
                        value={personalInfo.password}
                        onChange={(e) => handlePersonalInfoChange('password', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={personalInfo.confirmPassword}
                        onChange={(e) => handlePersonalInfoChange('confirmPassword', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSavePersonalInfo} disabled={loading} className="bg-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save Personal Information
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="banking" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Bank Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={bankingInfo.accountNumber}
                        onChange={(e) => handleBankingInfoChange('accountNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={bankingInfo.bankName}
                        onChange={(e) => handleBankingInfoChange('bankName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="momoNumber">Mobile Money Number</Label>
                      <Input
                        id="momoNumber"
                        value={bankingInfo.momoNumber}
                        onChange={(e) => handleBankingInfoChange('momoNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="momoProvider">Mobile Money Provider</Label>
                      <Input
                        id="momoProvider"
                        placeholder="e.g., MTN, Orange"
                        value={bankingInfo.momoProvider}
                        onChange={(e) => handleBankingInfoChange('momoProvider', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveBankingInfo} disabled={loading} className="bg-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save Banking Information
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
