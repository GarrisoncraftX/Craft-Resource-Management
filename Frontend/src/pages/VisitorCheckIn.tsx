import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertTriangle, UserCheck } from 'lucide-react';
import { visitorApiService } from '@/services/visitorApi';
import { useAuth } from '@/contexts/AuthContext';
import type { EntryPass } from '@/types/visitor';

export const VisitorCheckIn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { isAuthenticated } = useAuth();

  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [entryPass, setEntryPass] = useState<EntryPass | null>(null);
  const [employees, setEmployees] = useState<Array<{ id: number; name: string }>>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    email: '',
    visiting_employee_id: '',
    purpose_of_visit: '',
  });

  useEffect(() => {
    // If user is authenticated, redirect to employee dashboard
    if (isAuthenticated) {
      navigate('/employee-dashboard');
      return;
    }

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
          setIsValidating(true);
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
  }, [token, isAuthenticated, navigate]);

  const loadEmployees = async () => {
    try {
      // Use direct fetch without Authorization header for public endpoint
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? `http://172.20.10.5:5003`;
      const response = await fetch(`${API_BASE_URL}/hr/employees/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const employeeList = data.map((emp: { id: number; firstName: string; lastName: string }) => ({
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



  const handleEmployeeSearchChange = (searchValue: string) => {
    setEmployeeSearch(searchValue);
    const emp = employees.find(emp => emp.name === searchValue);
    if (emp) {
      handleInputChange('visiting_employee_id', emp.id.toString());
    } else {
      handleInputChange('visiting_employee_id', '');
    }
  };

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
      const checkInResult = await visitorApiService.checkInVisitor({
        ...formData,
        visiting_employee_id: Number.parseInt(formData.visiting_employee_id),
        qr_token: token,
      });

      // Generate entry pass
      try {
        const entryPassData = await visitorApiService.generateEntryPass(checkInResult.visitor_id);
        setEntryPass(entryPassData);
      } catch (error_) {
        console.error('Failed to generate entry pass:', error_);
      }

      setSuccess(true);
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
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground mb-4">Welcome, {formData.full_name}!</p>

            {entryPass && (
              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                <h3 className="font-semibold text-lg mb-2">Your Entry Pass</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Visitor:</strong> {entryPass.visitor_name}</p>
                  <p><strong>Host:</strong> {entryPass.host_name}</p>
                  <p><strong>Purpose:</strong> {entryPass.purpose}</p>
                  <p><strong>Valid Until:</strong> {new Date(entryPass.valid_until).toLocaleString()}</p>
                </div>
                <div className="mt-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(entryPass.qr_code)}`}
                    alt="Entry Pass QR Code"
                    className="mx-auto"
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Please show this entry pass at security checkpoints.
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
              <Input
                id="visiting_employee_id"
                list="employees"
                placeholder="Search employee..."
                value={employeeSearch}
                onChange={(e) => handleEmployeeSearchChange(e.target.value)}
                required
              />
              <datalist id="employees">
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name} />
                ))}
              </datalist>
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
