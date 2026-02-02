import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Clock, HardDrive } from 'lucide-react';
import { adminApiService } from '@/services/javabackendapi/adminApi';
import { hrApiService } from '@/services/javabackendapi/hrApi';
import { UnifySidebar } from '@/components/ui/UnifySidebar';
import type { AuditLog } from '@/services/mockData/admin';
import type { User } from '@/types/javabackendapi/hrTypes';
import type { SystemStats, AuditStatistics } from '@/types/javabackendapi/adminTypes';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [auditStats, setAuditStats] = useState<AuditStatistics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, auditStatsData, logsData, usersData] = await Promise.all([
          adminApiService.getSystemStats(),
          adminApiService.getAuditStatistics(),
          adminApiService.getAuditLogs(5),
          hrApiService.listEmployees()
        ]);
        setStats(statsData);
        setAuditStats(auditStatsData);
        setAuditLogs(logsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <UnifySidebar />
      
      <div className="flex-1 w-[70vw] overflow-auto">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and analytics</p>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats Overview - KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.activeSessions || 0}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.uptime || '99.9%'}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.storageUsed || '0%'}</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Database Analytics */}
          {auditStats && (
            <Card>
              <CardHeader>
                <CardTitle>Audit Log Analytics</CardTitle>
                <CardDescription>System activity and audit statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{auditStats.totalLogs || 0}</p>
                    <p className="text-sm text-gray-600">Total Logs</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{auditStats.todayLogs || 0}</p>
                    <p className="text-sm text-gray-600">Today's Logs</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{auditStats.weekLogs || 0}</p>
                    <p className="text-sm text-gray-600">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Events</CardTitle>
              <CardDescription>Latest audit logs and system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No recent system events</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{log.action}</h4>
                            <Badge variant={log.result === 'failure' ? 'destructive' : 'secondary'}>
                              {log.result || 'success'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="font-medium">Performed by:</span>
                            <span className="text-blue-600">{log.userId ? `User #${log.userId}` : 'System'}</span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-3">
                        {log.entityType && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">Entity:</span>
                            <span className="text-gray-900">{log.entityType}{log.entityId && ` #${log.entityId}`}</span>
                          </div>
                        )}
                        {log.serviceName && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">Service:</span>
                            <span className="text-gray-900">{log.serviceName}</span>
                          </div>
                        )}
                        {log.ipAddress && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">IP Address:</span>
                            <span className="text-gray-900">{log.ipAddress}</span>
                          </div>
                        )}
                        {log.sessionId && (
                          <div className="flex gap-2">
                            <span className="text-gray-500">Session:</span>
                            <span className="text-gray-900 font-mono text-xs">{log.sessionId.substring(0, 12)}...</span>
                          </div>
                        )}
                      </div>
                      
                      {log.details && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700">{log.details}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
