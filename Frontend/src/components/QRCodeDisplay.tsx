import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, QrCode, RefreshCw } from 'lucide-react';
import { visitorApiService } from '@/services/visitorApi';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  type: 'visitor' | 'employee';
  refreshInterval?: number; // in milliseconds, default 30000 (30 seconds)
  employeeId?: string; // for employee attendance QR
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  type,
  refreshInterval = 30000,
  employeeId,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (type === 'visitor') {
        // Generate dynamic token for visitor check-in
        const tokenData = await visitorApiService.generateQRToken();
        const checkInUrl = `${window.location.origin}/visitor/checkin?token=${tokenData.token}`;
        
        const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#1e40af',
            light: '#ffffff',
          },
        });
        
        setQrCodeUrl(qrDataUrl);
        setToken(tokenData.token);
      } else if (type === 'employee' && employeeId) {
        // Generate QR code for employee attendance
        const attendanceData = JSON.stringify({
          type: 'attendance',
          employeeId,
          timestamp: new Date().toISOString(),
        });
        
        const qrDataUrl = await QRCode.toDataURL(attendanceData, {
          width: 400,
          margin: 2,
          color: {
            dark: '#059669',
            light: '#ffffff',
          },
        });
        
        setQrCodeUrl(qrDataUrl);
      }

      setTimeRemaining(refreshInterval / 1000);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateQRCode();

    // Refresh QR code at specified interval
    const refreshTimer = setInterval(() => {
      generateQRCode();
    }, refreshInterval);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) return refreshInterval / 1000;
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(countdownTimer);
    };
  }, [refreshInterval, employeeId, type]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <QrCode className="h-8 w-8 text-primary mr-2" />
          <CardTitle>
            {type === 'visitor' ? 'Visitor Check-In' : 'Employee Attendance'}
          </CardTitle>
        </div>
        <CardDescription>
          {type === 'visitor'
            ? 'Scan this QR code with your mobile device to check in'
            : 'Scan this QR code with your mobile app to mark attendance'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg shadow-inner">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              <span>Refreshes in {timeRemaining} seconds</span>
            </div>

            {type === 'visitor' && token && (
              <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                Token: {token.substring(0, 16)}...
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground mt-4">
              <p className="font-semibold mb-1">Instructions:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Open your camera app or QR scanner</li>
                <li>Point at the QR code above</li>
                <li>Follow the link to complete {type === 'visitor' ? 'check-in' : 'attendance'}</li>
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
