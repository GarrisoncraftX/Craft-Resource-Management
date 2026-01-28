import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import type { LeaveRequest } from '@/types/nodejsbackendapi/leaveTypes';

interface LeaveCalendarProps {
  requests: LeaveRequest[];
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ requests }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [dateLeaves, setDateLeaves] = useState<Map<string, LeaveRequest[]>>(new Map());

  useEffect(() => {
    const leavesMap = new Map<string, LeaveRequest[]>();
    requests.filter(req => req.status === 'approved').forEach(request => {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (!leavesMap.has(dateKey)) {
          leavesMap.set(dateKey, []);
        }
        const leaves = leavesMap.get(dateKey);
        if (leaves) leaves.push(request);
      }
    });
    setDateLeaves(leavesMap);
  }, [requests]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave Calendar</CardTitle>
          <CardDescription>Hover over highlighted dates to see who is on leave</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasLeave: (date) => {
                  const dateKey = date.toISOString().split('T')[0];
                  return dateLeaves.has(dateKey);
                }
              }}
              modifiersStyles={{
                hasLeave: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
              onDayMouseEnter={(date) => setHoveredDate(date)}
              onDayMouseLeave={() => setHoveredDate(null)}
            />
            {hoveredDate && dateLeaves.has(hoveredDate.toISOString().split('T')[0]) && (
              <div className="absolute z-50 bg-white border rounded-lg shadow-lg p-3 mt-2 max-w-xs">
                <p className="font-semibold mb-2">{hoveredDate.toLocaleDateString()}</p>
                <div className="space-y-1">
                  {dateLeaves.get(hoveredDate.toISOString().split('T')[0])?.map((req) => (
                    <p key={req.id} className="text-sm">
                      {req.User ? `${req.User.firstName} ${req.User.lastName}` : `Employee ${req.userId}`} - {req.leaveType?.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Schedule</CardTitle>
          <CardDescription>All approved leaves</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {requests
              .filter(request => request.status === 'approved')
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map((request) => (
                <div key={request.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">
                      {request.User ? `${request.User.firstName} ${request.User.lastName}` : `Employee ${request.userId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{request.leaveType?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()} ({request.totalDays} {request.totalDays === 1 ? 'day' : 'days'})
                    </p>
                  </div>
                  <Badge variant="default">Approved</Badge>
                </div>
              ))}
            {requests.filter(request => request.status === 'approved').length === 0 && (
              <p className="text-center text-muted-foreground py-8">No approved leaves scheduled</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
