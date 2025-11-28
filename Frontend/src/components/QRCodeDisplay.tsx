import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, QrCode } from 'lucide-react';
import { visitorApiService } from '@/services/visitorApi';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  type?: 'attendance' | 'visitor';
  refreshInterval?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  type = 'attendance', 
  refreshInterval = 30000 
}) => {
  const { toast } = useToast();
  const [qrData, setQrData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const [sessionToken, setSessionToken] = useState<string>('');

  const generateQR = async () => {
    setIsLoading(true);
    try {
      if (type === 'visitor') {
        const response = await visitorApiService.generateQRToken();
        setQrData(response.check_in_url);
        setSessionToken(response.token);
        
        // Calculate seconds until expiration
        const expiresAtTime = new Date(response.expires_at).getTime();
        const nowTime = new Date().getTime();
        const secondsUntilExpiry = Math.floor((expiresAtTime - nowTime) / 1000);
        setExpiresIn(secondsUntilExpiry);
      } else {
        // Attendance QR code logic - call backend API
        const response = await fetch('/api/biometric/kiosk/qr-display', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to generate attendance QR code');
        }

        const qrResult = await response.json();
        setQrData(qrResult.qr_data);
        setSessionToken(qrResult.session_token);
        setExpiresIn(qrResult.expires_in);
      }

      toast({
        title: 'QR Code Generated',
        description: `Your ${type} QR code is ready to display`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate QR code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateQR();
    
    // Auto-refresh QR code based on refreshInterval
    const autoRefreshTimer = setInterval(() => {
      generateQR();
    }, refreshInterval);
    
    return () => clearInterval(autoRefreshTimer);
  }, [type, refreshInterval]);

  useEffect(() => {
    if (expiresIn > 0) {
      const timer = setInterval(() => {
        setExpiresIn((prev) => {
          if (prev <= 1) {
            setQrData('');
            setSessionToken('');
            toast({
              title: 'QR Code Expired',
              description: 'Please generate a new QR code',
              variant: 'destructive',
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [expiresIn, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Generating QR Code...</p>
        </CardContent>
      </Card>
    );
  }

  if (!qrData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5" />
            {type === 'visitor' ? 'Visitor Check-In QR Code' : 'Attendance QR Code'}
          </CardTitle>
          <CardDescription>
            {type === 'visitor' 
              ? 'Generate a QR code for visitor check-in' 
              : 'Generate a QR code for attendance verification'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={generateQR} size="lg" className="w-full">
            <QrCode className="mr-2 h-4 w-4" />
            Generate QR Code
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5" />
            {type === 'visitor' ? 'Visitor Check-In QR Code' : 'Your Attendance QR Code'}
          </CardTitle>
          <CardDescription>
            {type === 'visitor' 
              ? 'Visitors scan this code to begin check-in' 
              : 'Show this QR code to the attendance scanner'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
              alt="Attendance QR Code"
              className="mx-auto"
            />
          </div>

          <Alert>
            <QrCode className="h-4 w-4" />
            <AlertDescription>
              Expires in: <strong>{formatTime(expiresIn)}</strong>
            </AlertDescription>
          </Alert>

          <div className="text-xs text-muted-foreground">
            Session: {sessionToken.slice(0, 8)}...
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={generateQR}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate New Code
        </Button>
      </div>
    </div>
  );
};
