import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Monitor, Smartphone, Tablet } from 'lucide-react';
import { authApiService } from '@/services/nodejsbackendapi/authApi';
import type { Session } from '@/types/nodejsbackendapi/authTypes';

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await authApiService.getActiveSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authApiService.revokeSession(sessionId);
      setSuccess('Session revoked successfully');
      loadSessions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await authApiService.revokeAllSessions();
      setSuccess('All sessions revoked successfully');
      loadSessions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke all sessions');
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return <Smartphone className="h-5 w-5" />;
    if (device.toLowerCase().includes('tablet')) return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <p>Loading sessions...</p>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.userAgent || 'desktop')}
                    <div>
                      <p className="font-medium">{session.userAgent || 'Unknown Device'}</p>
                      <p className="text-sm text-gray-500">{session.ipAddress}</p>
                      <p className="text-xs text-gray-400">
                        Last active: {new Date(session.lastActivity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>

            {sessions.length > 1 && (
              <Button variant="outline" onClick={handleRevokeAll} className="w-full">
                Revoke All Sessions
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
