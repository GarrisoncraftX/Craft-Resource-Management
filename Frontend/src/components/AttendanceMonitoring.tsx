import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import {
  getManualFallbackAttendances,
  getBuddyPunchReport,
  getAttendanceMethodStatistics,
  flagBuddyPunchRisk,
} from '@/services/api';

interface ManualAttendance {
  id: number | string;
  user_id?: string;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  user?: { employee_id: string; first_name: string; last_name: string };
  clock_in_time: string;
  clock_out_time?: string;
  audit_notes?: string;
}

interface MethodStats {
  qrCount: number;
  manualCount: number;
  biometricCount: number;
  totalAttendances: number;
  manualPercentage: number;
}

export function AttendanceMonitoring() {
  const [manualAttendances, setManualAttendances] = useState<ManualAttendance[]>([]);
  const [methodStats, setMethodStats] = useState<MethodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flaggingId, setFlaggingId] = useState<number | null>(null);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const [manualData, statsData] = await Promise.all([
        getManualFallbackAttendances(),
        getAttendanceMethodStatistics(),
      ]);
      setManualAttendances(manualData || []);
      setMethodStats(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to load attendance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagBuddyPunch = async (attendanceId: number) => {
    try {
      setFlaggingId(attendanceId);
      await flagBuddyPunchRisk(attendanceId, 'Flagged for buddy punch review');
      await loadAttendanceData();
    } catch (err) {
      setError('Failed to flag attendance');
      console.error(err);
    } finally {
      setFlaggingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Method Statistics */}
      {methodStats && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">QR Code</div>
                <div className="text-2xl font-bold text-blue-600">{methodStats.qrCount}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Manual</div>
                <div className="text-2xl font-bold text-red-600">{methodStats.manualCount}</div>
                <div className="text-xs text-red-500">{methodStats.manualPercentage.toFixed(1)}%</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Biometric</div>
                <div className="text-2xl font-bold text-green-600">{methodStats.biometricCount}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-2xl font-bold text-gray-600">{methodStats.totalAttendances}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Fallback Attendances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Manual Fallback Entries ({manualAttendances.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {manualAttendances.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <CheckCircle className="h-5 w-5 mr-2" />
              No manual fallback entries detected
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2 text-left">Clock In</th>
                    <th className="px-4 py-2 text-left">Clock Out</th>
                    <th className="px-4 py-2 text-left">Notes</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {manualAttendances.map((attendance) => (
                    <tr key={attendance.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="font-medium">
                          {attendance.user?.first_name || attendance.first_name} {attendance.user?.last_name || attendance.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{attendance.user?.employee_id || attendance.employee_id}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {new Date(attendance.clock_in_time).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {attendance.clock_out_time
                          ? new Date(attendance.clock_out_time).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">
                        {attendance.audit_notes || '-'}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlagBuddyPunch(typeof attendance.id === 'number' ? attendance.id : parseInt(String(attendance.id)))}
                          disabled={flaggingId === attendance.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {flaggingId === attendance.id ? 'Flagging...' : 'Flag'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Buddy Punch Risk Alert */}
      {manualAttendances.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {manualAttendances.length} manual fallback entries detected. These entries require HR review
            to prevent buddy punching. Review and flag suspicious entries immediately.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
