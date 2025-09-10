
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Fingerprint } from 'lucide-react';
import { fingerprintBridge } from '@/utils/fingerprintBridge';

interface FingerprintScannerProps {
  onCapture: (template: string) => void;
  isActive: boolean;
}

export const FingerprintScanner: React.FC<FingerprintScannerProps> = ({ onCapture, isActive }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);

  const checkService = useCallback(async () => {
    const available = await fingerprintBridge.isServiceAvailable();
    setServiceAvailable(available);
    return available;
  }, []);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setError('');
    setScanResult('');

    try {
      // Check if service is available first
      const available = await checkService();
      
      let result;
      if (available) {
        console.log('Using real fingerprint scanner...');
        result = await fingerprintBridge.scanFingerprint();
      } else {
        console.log('Fingerprint service unavailable, using simulation...');
        result = await fingerprintBridge.simulateScan();
      }

      if (result.success && result.template) {
        setScanResult(result.template);
        onCapture(result.template);
      } else {
        setError(result.error || 'Scan failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }

    setIsScanning(false);
  }, [onCapture, checkService]);

  React.useEffect(() => {
    if (isActive) {
      checkService();
    }
  }, [isActive, checkService]);

  if (!isActive) return null;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className={`p-6 rounded-full ${isScanning ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'}`}>
            <Fingerprint className={`h-12 w-12 ${isScanning ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Fingerprint Scanner</h3>
          
          {serviceAvailable === false && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Hardware scanner not detected. Using simulation mode.
              </AlertDescription>
            </Alert>
          )}

          {serviceAvailable === true && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Scanner Ready
            </Badge>
          )}
        </div>

        {isScanning && (
          <div className="text-blue-600">
            <p>Place your finger on the scanner...</p>
            <div className="flex justify-center mt-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {scanResult && (
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Fingerprint Captured
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Template: {scanResult.substring(0, 20)}...
            </p>
          </div>
        )}

        <Button
          onClick={handleScan}
          disabled={isScanning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isScanning ? 'Scanning...' : 'Scan Fingerprint'}
        </Button>
      </div>
    </Card>
  );
};
