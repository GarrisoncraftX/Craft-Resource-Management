import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import type { LeaveBalance } from '@/types/nodejsbackendapi/leaveTypes';

interface LeaveBalancesProps {
  balances: LeaveBalance[];
  onInitialize: (userId: number) => void;
}

export const LeaveBalances: React.FC<LeaveBalancesProps> = ({ balances, onInitialize }) => {
  const [showInitialize, setShowInitialize] = useState(false);
  const [userId, setUserId] = useState('');
  const handleInitialize = () => {
    const id = Number.parseInt(userId);
    if (id && !isNaN(id)) {
      onInitialize(id);
      setUserId('');
      setShowInitialize(false);
    }
  };

  if (!balances || balances.length === 0) {
    return (
      <>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowInitialize(!showInitialize)}>
            <UserPlus className="h-4 w-4 mr-2" /> Initialize Leave Balances
          </Button>
        </div>
        {showInitialize && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Initialize Leave Balances</CardTitle>
              <CardDescription>Assign leave balances to an employee</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Employee ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter employee user ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleInitialize}>Initialize</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No leave balances available. Initialize leave balances for employees using the button above.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  const groupedBalances = balances.reduce((acc, balance) => {
    const employeeId = balance.userId || 'unknown';
    if (!acc[employeeId]) {
      acc[employeeId] = {
        firstName: balance.firstName,
        middleName: balance.middleName,
        lastName: balance.lastName,
        employeeName: balance.employeeName,
        balances: []
      };
    }
    acc[employeeId].balances.push(balance);
    return acc;
  }, {} as Record<string, { firstName?: string; middleName?: string; lastName?: string; employeeName?: string; balances: LeaveBalance[] }>);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowInitialize(!showInitialize)}>
          <UserPlus className="h-4 w-4 mr-2" /> Initialize Leave Balances
        </Button>
      </div>
      {showInitialize && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Initialize Leave Balances</CardTitle>
            <CardDescription>Assign leave balances to an employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Employee ID</Label>
                <Input
                  type="number"
                  placeholder="Enter employee user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleInitialize}>Initialize</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {Object.entries(groupedBalances).map(([employeeId, employeeData]) => {
        const displayName = employeeData.employeeName ||
          `${employeeData.firstName || ''} ${employeeData.middleName ? employeeData.middleName + ' ' : ''}${employeeData.lastName || ''}`.trim() ||
          `Employee ${employeeId}`;

        return (
          <Card key={employeeId}>
            <CardHeader>
              <CardTitle>
                <h3 className="text-xl font-semibold">{displayName}</h3>
              </CardTitle>
              <CardDescription>Leave balances for {employeeData.firstName || displayName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {employeeData.balances.map((balance) => (
                  <div key={balance.leaveTypeId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{balance.leaveTypeName}</span>
                      <span className="text-lg font-bold">{balance.remainingDays} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${balance.allocatedDays > 0 ? (balance.remainingDays / balance.allocatedDays) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Allocated: {balance.allocatedDays} | Used: {balance.usedDays} | Remaining: {balance.remainingDays}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};
