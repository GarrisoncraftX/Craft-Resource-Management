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

      // Request camera permissions explicitly for mobile devices
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // For iOS devices, we need to handle camera permissions differently
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isAndroid = /Android/.test(navigator.userAgent);
          const constraints = isIOS ? {
            video: {
              facingMode: 'environment',
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 30 }
            }
          } : isAndroid ? {
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          } : {
            video: { facingMode: 'environment' }
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          // Stop the temporary stream
          stream.getTracks().forEach(track => track.stop());
        } catch (permError) {
          console.warn('Camera permission request failed:', permError);
          // Continue anyway, qr-scanner will handle permissions
        }
      }

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          onScan(result.data);
          stopScanning();
        },
        {
          onDecodeError: (err) => {
            // Only log errors, don't show to user unless persistent
            console.debug('QR decode error:', err);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Prefer back camera
          maxScansPerSecond: 5, // Reduce CPU usage
          calculateScanRegion: (video) => {
            // Calculate scan region to improve detection on mobile
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const regionSize = Math.min(videoWidth, videoHeight) * 0.6; // 60% of smaller dimension
            const regionX = (videoWidth - regionSize) / 2;
            const regionY = (videoHeight - regionSize) / 2;
            return {
              x: regionX,
              y: regionY,
              width: regionSize,
              height: regionSize,
              downScaledWidth: 400,
              downScaledHeight: 400
            };
          }
        }
      );



      await qrScanner.start();
      setScanner(qrScanner);
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
      let errorMessage = 'Failed to start camera';

      if (err instanceof Error) {
        if (err.message.includes('permission')) {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'No camera found on this device.';
        } else if (err.message.includes('NotAllowedError')) {
          errorMessage = 'Camera access denied. Please enable camera permissions in your browser settings.';
        } else if (err.message.includes('NotFoundError')) {
          errorMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (err.message.includes('NotReadableError')) {
          errorMessage = 'Camera is being used by another application. Please close other camera apps.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
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
