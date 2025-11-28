import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Loader2, Scan } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  isActive: boolean;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanner, setScanner] = useState<QrScanner | null>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isActive]);

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      if (!videoRef.current) return;

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          onScan(result.data);
          stopScanning();
        },
        {
          onDecodeError: (err) => {
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScanner.start();
      setScanner(qrScanner);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    setIsScanning(false);
  };

  if (!isActive) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <Scan className="h-6 w-6 mr-2" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Click the button below to start scanning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => startScanning()} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Start Scanning
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center">
          <Scan className="h-6 w-6 mr-2" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Position the QR code within the camera frame
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          {isScanning && (
            <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 border-2 border-green-400 rounded-lg opacity-50"></div>
              </div>
            </div>
          )}
        </div>

        {isScanning && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Scanning for QR code...
          </div>
        )}

        <Button onClick={stopScanning} variant="outline" className="w-full">
          Stop Scanning
        </Button>
      </CardContent>
    </Card>
  );
};
