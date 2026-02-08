import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Users, Clock, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/ui/Navbar';
import { useNavigate } from 'react-router-dom';
import { LogoSpinner } from '@/components/ui/LogoSpinner';
import {
  fetchProvisionedEmployees,
  getManualFallbackAttendances,
  getAttendanceMethodStatistics,
  flagBuddyPunchRisk,
  reviewAttendance
} from '@/services/api';
import type { ManualFallbackAttendance, AttendanceMethodStats } from '@/types/pythonbackendapi/attendanceTypes';
import type { ProvisionedEmployee } from '@/types/javabackendapi/hrTypes';

export const HRDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance');
  const [provisionedEmployees, setProvisionedEmployees] = useState<ProvisionedEmployee[]>([]);
  const [manualAttendances, setManualAttendances] = useState<ManualFallbackAttendance[]>([]);
  const [methodStats, setMethodStats] = useState<AttendanceMethodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);

  useEffect(() => {
    loadHRData();
  }, []);

  const loadHRData = async () => {
    try {
      setLoading(true);
      const [provisionedData, manualData, statsData] = await Promise.all([
        fetchProvisionedEmployees(),
        getManualFallbackAttendances(),
        getAttendanceMethodStatistics(),
      ]);
      setProvisionedEmployees(provisionedData || []);
      setManualAttendances(Array.isArray(manualData) ? manualData : []);
      setMethodStats(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to load HR data');
      console.error('Error loading HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (id: number) => {
    navigate(`/hr/employee/${id}`);
  };

  const handleFlagBuddyPunch = async (attendanceId: string) => {
    try {
      setFlaggingId(attendanceId);
      const response = await flagBuddyPunchRisk(Number(attendanceId), 'Flagged for buddy punch review by HR');
      if (response.success) {
        await loadHRData();
        toast.success('Attendance flagged for review');
      } else {
        throw new Error(response.message || 'Failed to flag attendance');
      }
    } catch (err) {
      const errorMsg = err?.message || 'Failed to flag attendance';
      setError(errorMsg);
      console.error('Error flagging attendance:', err);
      toast.error(errorMsg);
    } finally {
      setFlaggingId(null);
    }
  };

  const openReviewDialog = (attendanceId: string) => {
    setSelectedAttendanceId(attendanceId);
    setReviewNote('');
    setReviewDialogOpen(true);
  };

  const handleReviewAttendance = async () => {
    if (!selectedAttendanceId || !reviewNote.trim()) {
      toast.error('Please provide review notes');
      return;
    }
    try {
      setReviewingId(selectedAttendanceId);
      const response = await reviewAttendance(Number(selectedAttendanceId), Number(user?.userId) || 0, reviewNote);
      if (response.success) {
        await loadHRData();
        toast.success('Attendance reviewed successfully');
        setReviewDialogOpen(false);
        setReviewNote('');
        setSelectedAttendanceId(null);
      } else {
        throw new Error(response.message || 'Failed to review attendance');
      }
    } catch (err) {
      const errorMsg = err?.message || 'Failed to review attendance';
      setError(errorMsg);
      console.error('Error reviewing attendance:', err);
      toast.error(errorMsg);
    } finally {
      setReviewingId(null);
    }
  };

  const handleViewDashboard = () => {
    navigate('/employee-dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar
          title="HR Dashboard"
          onViewDashboard={handleViewDashboard}
          onLogout={handleLogout}
          toggleSidebar={() => {}}
          isEmployeeDashboard={false}
        />
        <div className="pt-20 px-6 pb-6">
          <div className="flex justify-center items-center h-64">
            <LogoSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="HR Dashboard"
        onViewDashboard={handleViewDashboard}
        onLogout={handleLogout}
        toggleSidebar={() => {}}
        isEmployeeDashboard={false}
      />

      <div className="pt-8 px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">HR Dashboard</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">Monitor employee provisioning and attendance governance</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Provisioned Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{provisionedEmployees.length}</div>
                <p className="text-gray-600 text-xs sm:text-sm">Awaiting profile completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Manual Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{manualAttendances.length}</div>
                <p className="text-gray-600 text-xs sm:text-sm">Require HR review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Total Attendances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{methodStats?.totalAttendances || 0}</div>
                <p className="text-gray-600 text-xs sm:text-sm">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-0 h-auto sm:h-10">
              <TabsTrigger value="attendance" className="text-xs sm:text-sm whitespace-normal h-auto py-2 sm:py-0">Attendance Governance</TabsTrigger>
              <TabsTrigger value="provisioning" className="text-xs sm:text-sm whitespace-normal h-auto py-2 sm:py-0">Identity & Lifecycle Management</TabsTrigger>
            </TabsList>

            {/* Pillar 1: Identity & Lifecycle Management */}
            <TabsContent value="attendance" className="space-y-4">
              {/* Method Statistics */}
              {methodStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">Attendance Method Distribution</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Monitor check-in methods to detect potential buddy punching</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 lg:gap-4">
                      <div className="bg-blue-50 p-2 sm:p-3 lg:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">QR Code</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{methodStats.qrCount}</div>
                      </div>
                      <div className="bg-red-50 p-2 sm:p-3 lg:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">Manual</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{methodStats.manualCount}</div>
                        <div className="text-xs text-red-500">{(methodStats.manualPercentage || 0).toFixed(1)}%</div>
                      </div>
                   
                      <div className="bg-gray-50 p-2 sm:p-3 lg:p-4 rounded-lg">
                        <div className="text-xs sm:text-sm text-gray-600">Total</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-600">{methodStats.totalAttendances}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Manual Fallback Attendances */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Manual Check-in Reviews (Buddy Punch Prevention)
                  </CardTitle>
                  <CardDescription>
                    Review manual check-ins to prevent buddy punching. All manual entries are automatically flagged.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {manualAttendances.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      No manual fallback entries detected
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <Table className="min-w-[640px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Review Status</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {manualAttendances.map((attendance) => (
                            <tr key={attendance.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">
                                <div className="font-medium">
                                  {attendance.employee_name || 'Unknown User'}
                                </div>
                                <div className="text-xs text-gray-500">{attendance.employee_id || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  {new Date(attendance.clock_in_time).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                {attendance.clock_out_time
                                  ? new Date(attendance.clock_out_time).toLocaleString()
                                  : '-'}
                              </td>
                              <td className="px-4 py-2">
                                <Badge variant={attendance.reviewed_at ? "default" : "destructive"}>
                                  {attendance.reviewed_at ? "Reviewed" : "Pending Review"}
                                </Badge>
                              </td>
                              <td className="px-4 py-2 text-xs text-gray-600">
                                {attendance.audit_notes || '-'}
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex gap-2">
                                  {!attendance.reviewed_at && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleFlagBuddyPunch(attendance.id)}
                                      disabled={flaggingId === attendance.id}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      {flaggingId === attendance.id ? 'Flagging...' : 'Flag Risk'}
                                    </Button>
                                  )}
                                  {!attendance.reviewed_at && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => openReviewDialog(attendance.id)}
                                      disabled={reviewingId === attendance.id}
                                    >
                                      {reviewingId === attendance.id ? 'Reviewing...' : 'Review'}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {manualAttendances.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {manualAttendances.length} manual check-in entries detected. HR review required to prevent
                    buddy punching. Review each entry and flag suspicious activities immediately.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Pillar 2: Attendance Governance */}
             <TabsContent value="provisioning" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Provisioned Employees (Gatekeeper Monitoring)
                  </CardTitle>
                  <CardDescription>
                    New hires in PROVISIONED state - ensure they complete password change and bank info setup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {provisionedEmployees.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      No provisioned employees pending activation
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <Table className="min-w-[640px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Provisioned Date</TableHead>
                            <TableHead>Profile Status</TableHead>
                            <TableHead>Password Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {provisionedEmployees.map((employee) => (
                            <TableRow key={employee.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {employee.firstName} {employee.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{employee.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono">{employee.employeeId}</TableCell>
                              <TableCell>
                                {new Date(employee.provisionedDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={employee.profileCompleted ? "default" : "secondary"}>
                                  {employee.profileCompleted ? "Completed" : "Pending"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={employee.defaultPasswordChanged ? "default" : "destructive"}>
                                  {employee.defaultPasswordChanged ? "Changed" : "Default"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewEmployee(employee.id)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {provisionedEmployees.length > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Users className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    {provisionedEmployees.length} employees are in PROVISIONED state. Monitor their progress
                    in completing profiles (password change + bank info) to activate their accounts.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Attendance</DialogTitle>
            <DialogDescription>
              Provide your review notes for this manual attendance entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter your review notes here... (e.g., 'Verified with employee - legitimate manual entry due to QR code scanner malfunction')" 
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewAttendance} disabled={!reviewNote.trim() || !!reviewingId}>
              {reviewingId ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
