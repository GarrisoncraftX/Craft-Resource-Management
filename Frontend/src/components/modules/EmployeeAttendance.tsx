import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserCheck, LogOut, Search, RefreshCw, QrCode, Clock, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { attendanceApiService } from '@/services/pythonbackendapi/attendanceApi';
import type { AttendanceRecord, AttendanceStats, AttendanceSearchParams } from '@/types/attendance';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface EmployeeAttendanceProps {
  moduleType: 'hr' | 'security';
}

export const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = ({ moduleType }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [checkedInEmployees, setCheckedInEmployees] = useState<AttendanceRecord[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    onTime: 0,
    late: 0,
    absent: 0,
    present: 0,
    totalEmployees: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [searchParams, setSearchParams] = useState<AttendanceSearchParams>({
    employee_name: '',
    department: '',
    date_from: '',
    date_to: '',
    status: '',
  });

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      const [recordsResponse, checkedInResponse, statsResponse] = await Promise.all([
        attendanceApiService.getAttendanceRecords(),
        attendanceApiService.getCheckedInEmployees(),
        attendanceApiService.getAttendanceStats()
      ]);

      setAttendanceRecords(recordsResponse);
      setCheckedInEmployees(checkedInResponse);
      setStats(statsResponse);

      if (recordsResponse) {
        const uniqueDepartments = Array.from(
          new Set(recordsResponse.map((r) => r.department).filter((d): d is string => !!d))
        );
        setDepartments(uniqueDepartments.sort());
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load attendance data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const paramsToUse = {
        ...searchParams,
        department: searchParams.department === 'all' ? '' : searchParams.department,
      };
      const data = await attendanceApiService.getAttendanceRecords(paramsToUse);
      setAttendanceRecords(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search attendance records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      setIsRefreshingStats(true);
      const statsResponse = await attendanceApiService.getAttendanceStats();
      setStats(statsResponse);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh statistics',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { variant: 'default' as const, icon: CheckCircle, label: 'Present' },
      late: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Late' },
      absent: { variant: 'secondary' as const, icon: Clock, label: 'Absent' },
      early_out: { variant: 'outline' as const, icon: LogOut, label: 'Early Out' },
      incomplete: { variant: 'outline' as const, icon: Clock, label: 'Incomplete' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.incomplete;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const moduleTitle = moduleType === 'hr' ? 'HR - Employee Attendance' : 'Security - Employee Attendance';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{moduleTitle}</h2>
          <p className="text-muted-foreground">Manage employee attendance records</p>
        </div>
        <Button onClick={() => navigate('/kiosk-interface', { state: { mode: 'GENERATOR' } })} size="lg">
          <QrCode className="mr-2 h-5 w-5" />
          Kiosk Interface
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTime}</div>
            <p className="text-xs text-muted-foreground">Employees on time today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground">Employees late today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground">Currently checked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">Not checked in yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Currently Checked In Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Checked In</CardTitle>
          <CardDescription>
            {checkedInEmployees.length} employee{checkedInEmployees.length !== 1 ? 's' : ''} currently on site
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkedInEmployees.length === 0 ? (
            <Alert>
              <AlertDescription>No employees currently checked in</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checkedInEmployees.map((employee) => (
                <Card key={employee.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{employee.employee_name}</p>
                      <p className="text-sm text-muted-foreground">{employee.department}</p>
                      <p className="text-xs text-muted-foreground">
                        Since {formatTime(employee.clock_in_time)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="employee_name">Employee Name</Label>
              <Input
                id="employee_name"
                placeholder="Search by name"
                value={searchParams.employee_name}
                onChange={(e) => setSearchParams({ ...searchParams, employee_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={searchParams.department}
                onValueChange={(value) => setSearchParams({ ...searchParams, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date_from">From Date</Label>
              <Input
                id="date_from"
                type="date"
                value={searchParams.date_from}
                onChange={(e) => setSearchParams({ ...searchParams, date_from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date_to">To Date</Label>
              <Input
                id="date_to"
                type="date"
                value={searchParams.date_to}
                onChange={(e) => setSearchParams({ ...searchParams, date_to: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button onClick={loadAttendanceData} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={refreshStats} variant="outline" disabled={isRefreshingStats}>
                {isRefreshingStats ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            All attendance records ({attendanceRecords.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <Alert>
              <AlertDescription>No attendance records found</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.employee_id || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.employee_name}</div>
                          {record.designation && (
                            <div className="text-xs text-muted-foreground">{record.designation}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{record.department || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{formatTime(record.clock_in_time)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(record.clock_in_time)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.clock_out_time ? (
                          <div>
                            <div className="text-sm">{formatTime(record.clock_out_time)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(record.clock_out_time)}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {record.total_hours ? `${Number(record.total_hours).toFixed(2)}h` : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <div>In: {record.clock_in_time ? (record.clock_in_method || 'N/A') : 'N/A'}</div>
                          <div>Out: {record.clock_out_time ? (record.clock_out_method || 'N/A') : 'N/A'}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendance;
