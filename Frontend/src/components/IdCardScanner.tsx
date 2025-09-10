
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { mockIdCards } from '@/services/mockData';
import type { IdCardData } from '@/types/api';

interface IdCardScannerProps {
  onCardScanned: (cardData: IdCardData) => void;
  isActive: boolean;
}

export const IdCardScanner: React.FC<IdCardScannerProps> = ({ onCardScanned, isActive }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cardData, setCardData] = useState<IdCardData | null>(null);
  const [error, setError] = useState('');


  // Mock ID card data for simulation
  const idCards = mockIdCards;

  const simulateCardScan = async () => {
    setIsScanning(true);
    setError('');
    
    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly select a mock ID card or simulate unknown card
      const randomCard = Math.random() > 0.2 
        ? mockIdCards[Math.floor(Math.random() * mockIdCards.length)]
        : null;
      
      if (randomCard) {
        setCardData(randomCard);
        onCardScanned(randomCard);
      } else {
        // Simulate unknown card with just card ID
        const unknownCard = {
          cardId: `UNKNOWN_${Date.now()}`,
        };
        setCardData(unknownCard);
        onCardScanned(unknownCard);
      }
    } catch (err) {
      setError('Failed to scan ID card. Please try again.');
    }
    
    setIsScanning(false);
  };

  const resetScanner = () => {
    setCardData(null);
    setError('');
  };

  if (!isActive) return null;

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <CreditCard className="h-12 w-12 text-blue-600" />
          
          {!cardData && !isScanning && (
            <>
              <h3 className="text-lg font-semibold text-blue-900">ID Card Scanner</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tap your government ID card on the reader or click simulate for testing
              </p>
              <Button 
                onClick={simulateCardScan}
                disabled={isScanning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Simulate Card Scan
              </Button>
            </>
          )}

          {isScanning && (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-blue-700 font-medium">Scanning ID card...</p>
            </div>
          )}

          {cardData && (
            <div className="w-full space-y-3">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Card Scanned Successfully
              </Badge>
              
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Card Information:</h4>
                <div className="text-sm space-y-1 text-left">
                  <div><strong>Card ID:</strong> {cardData.cardId}</div>
                  {cardData.firstName && <div><strong>Name:</strong> {cardData.firstName} {cardData.lastName}</div>}
                  {cardData.employeeId && <div><strong>Employee ID:</strong> {cardData.employeeId}</div>}
                  {cardData.email && <div><strong>Email:</strong> {cardData.email}</div>}
                  {cardData.department && <div><strong>Department:</strong> {cardData.department}</div>}
                  {cardData.nationalId && <div><strong>National ID:</strong> {cardData.nationalId}</div>}
                  {cardData.phoneNumber && <div><strong>Phone:</strong> {cardData.phoneNumber}</div>}
                </div>
              </div>
              
              <Button 
                onClick={resetScanner}
                variant="outline"
                size="sm"
              >
                Scan Another Card
              </Button>
            </div>
          )}

          {error && (
            <div className="w-full">
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                {error}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
