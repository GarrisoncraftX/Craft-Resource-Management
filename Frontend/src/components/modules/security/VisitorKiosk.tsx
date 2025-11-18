import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { Building2, Scan } from 'lucide-react';

export const VisitorKiosk: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Our Facility
          </h1>
          <p className="text-xl text-blue-100">
            Please scan the QR code below to check in
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center mb-2">
              <Scan className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="text-2xl">Visitor Check-In</CardTitle>
            </div>
            <CardDescription className="text-base">
              Scan this QR code with your mobile device to begin the check-in process
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <QRCodeDisplay type="visitor" refreshInterval={30000} />
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 text-center">
                Check-In Steps:
              </h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                  <span>Open your phone's camera or QR code scanner</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                  <span>Point at the QR code displayed above</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
                  <span>Fill out the check-in form on your phone</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
                  <span>Wait for confirmation - your host will be notified</span>
                </li>
              </ol>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Need assistance? Please contact the reception desk.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
