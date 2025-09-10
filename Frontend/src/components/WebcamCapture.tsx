
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void;
  isActive: boolean;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(imageData);
      }
    }
  }, [onCapture]);

  React.useEffect(() => {
    if (isActive && !isCameraActive) {
      startCamera();
    } else if (!isActive && isCameraActive) {
      stopCamera();
    }
  }, [isActive, isCameraActive, startCamera, stopCamera]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isActive) return null;

  return (
    <Card className="p-4 space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-200"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex gap-2 justify-center">
        {!isCameraActive ? (
          <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
            Start Camera
          </Button>
        ) : (
          <>
            <Button onClick={captureImage} className="bg-green-600 hover:bg-green-700">
              Capture Face
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Stop Camera
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
