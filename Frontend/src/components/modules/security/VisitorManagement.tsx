import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserCheck, LogOut, Search, RefreshCw, QrCode } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { visitorApiService } from '@/services/pythonbackendapi/visitorApi';
import type { Visitor } from '@/types/pythonbackendapi/visitorTypes';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const VisitorManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    name: '',
    host: '',
    date: '',
  });

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await visitorApiService.getAllVisitors();
      setVisitors(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load visitors',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await visitorApiService.searchVisitors(searchParams);
      setVisitors(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search visitors',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async (visitorId: string) => {
    try {
      setIsCheckingOut(visitorId);
      await visitorApiService.checkOutVisitor({ visitor_id: visitorId });
      toast({
        title: 'Success',
        description: 'Visitor checked out successfully',
      });
      loadVisitors();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check out visitor',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(null);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Visitor Management</h2>
          <p className="text-muted-foreground">Manage visitor check-ins and check-outs</p>
        </div>
        <Button onClick={() => navigate('/security/visitor-kiosk')} size="lg">
          <QrCode className="mr-2 h-5 w-5" />
          Open Kiosk Display
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Search</CardTitle>
          <CardDescription>Search and filter visitor records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Visitor Name</Label>
              <Input
                id="name"
                placeholder="Search by name"
                value={searchParams.name}
                onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="host">Host Employee</Label>
              <Input
                id="host"
                placeholder="Search by host"
                value={searchParams.host}
                onChange={(e) => setSearchParams({ ...searchParams, host: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={loadVisitors} variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh List</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Logs</CardTitle>
          <CardDescription>
            All check-ins and check-outs ({visitors.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : visitors.length === 0 ? (
            <Alert>
              <AlertDescription>No visitors found</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Host Employee</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <TableRow key={visitor.visitor_id}>
                      <TableCell className="font-medium">
                        VST-{visitor.visitor_id?.toString().padStart(3, '0')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{visitor.full_name}</div>
                          {visitor.email && (
                            <div className="text-xs text-muted-foreground">{visitor.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{visitor.contact_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{visitor.purpose_of_visit}</TableCell>
                      <TableCell>{visitor.visiting_employee_name || `ID: ${visitor.visiting_employee_id}`}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{formatTime(visitor.check_in_time)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(visitor.check_in_time)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {visitor.check_out_time ? (
                          <div>
                            <div className="text-sm">{formatTime(visitor.check_out_time)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(visitor.check_out_time)}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={visitor.status === 'Checked In' ? 'default' : 'secondary'}
                        >
                          {visitor.status === 'Checked In' ? (
                            <>
                              <UserCheck className="mr-1 h-3 w-3" />
                              On Site
                            </>
                          ) : (
                            'Checked Out'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {visitor.status === 'Checked In' && (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCheckOut(visitor.visitor_id!)}
                                  disabled={isCheckingOut === visitor.visitor_id}
                                >
                                  {isCheckingOut === visitor.visitor_id ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      Checking Out...
                                    </>
                                  ) : (
                                    <>
                                      <LogOut className="mr-2 h-3 w-3" />
                                      Check Out
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Check Out Visitor</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
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

export default VisitorManagement;
