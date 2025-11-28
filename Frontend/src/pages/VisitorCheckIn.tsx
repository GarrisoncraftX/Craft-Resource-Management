import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertTriangle, UserCheck, Search } from 'lucide-react';
import { visitorApiService } from '@/services/visitorApi';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const VisitorCheckIn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [employees, setEmployees] = useState<Array<{ id: number; name: string }>>([]);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    email: '',
    visiting_employee_id: '',
    purpose_of_visit: '',
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing QR code token');
        setIsValidating(false);
        return;
      }

      try {
        const result = await visitorApiService.validateQRToken(token);
        if (result.valid) {
          setTokenValid(true);
          // Load employees for dropdown
          await loadEmployees();
        } else {
          setError(result.message || 'QR code has expired or is invalid');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to validate QR code');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const loadEmployees = async () => {
    try {
      const response = await hrApiService.listEmployees();
      const employeeList = response.map((emp) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
      }));
      setEmployees(employeeList);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filteredEmployees = useMemo(() => {
    if (!employeeSearchQuery) return employees;
    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase())
    );
  }, [employees, employeeSearchQuery]);

  const selectedEmployee = employees.find(
    (emp) => emp.id.toString() === formData.visiting_employee_id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid token');
      return;
    }

    // Validate form
    if (!formData.full_name || !formData.contact_number || !formData.visiting_employee_id || !formData.purpose_of_visit) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await visitorApiService.checkInVisitor({
        ...formData,
        visiting_employee_id: Number.parseInt(formData.visiting_employee_id),
        qr_token: token,
      });

      setSuccess(true);
      
      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating QR code...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-center">Invalid QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Please scan a new QR code from the kiosk display.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl">Check-in Complete!</CardTitle>
            <CardDescription className="text-center">
              Your host has been notified of your arrival.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Welcome, {formData.full_name}!</p>
            <p className="text-sm text-muted-foreground">
              Redirecting you shortly...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <UserCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">Visitor Check-In</CardTitle>
          <CardDescription className="text-center">
            Please provide your details to complete check-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_number">
                  Contact Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact_number"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.contact_number}
                  onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visiting_employee_id">
                Who are you visiting? <span className="text-destructive">*</span>
              </Label>
              <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeeSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedEmployee ? selectedEmployee.name : "Search employee..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search employee by name..." 
                      value={employeeSearchQuery}
                      onValueChange={setEmployeeSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No employee found.</CommandEmpty>
                      <CommandGroup>
                        {filteredEmployees.map((emp) => (
                          <CommandItem
                            key={emp.id}
                            value={emp.name}
                            onSelect={() => {
                              handleInputChange('visiting_employee_id', emp.id.toString());
                              setEmployeeSearchOpen(false);
                              setEmployeeSearchQuery('');
                            }}
                          >
                            {emp.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose_of_visit">
                Purpose of Visit <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="purpose_of_visit"
                placeholder="Business meeting, delivery, consultation, etc."
                value={formData.purpose_of_visit}
                onChange={(e) => handleInputChange('purpose_of_visit', e.target.value)}
                rows={3}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking In...
                </>
              ) : (
                'Complete Check-In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
