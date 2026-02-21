import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, KeyRound, Keyboard, Droplets, Cpu, Users, X, RefreshCw, Download, Printer, Maximize2, Minus, Pencil, RotateCcw, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { assetApiService } from '@/services/javabackendapi/assetApi';
import { systemApiService, type AuditLog } from '@/services/javabackendapi/systemApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { mockDashboardLocations } from '@/services/mockData/assets';
import { hrApiService } from '@/services/api';

// Big button card component matching Snipe-IT style
const StatusCard: React.FC<{
  icon: React.ReactNode;
  count: number;
  label: string;
  bgClass: string;
  onClick?: () => void;
}> = ({ icon, count, label, bgClass, onClick }) => (
   <button
    onClick={onClick}
    className={`${bgClass} rounded-lg p-3 sm:p-4 text-white flex flex-col items-start justify-between min-h-[90px] sm:min-h-[110px] w-full transition-all hover:opacity-90 hover:shadow-lg relative overflow-hidden`}
  >
    <div className="absolute right-2 top-2 opacity-20">{React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 sm:h-12 sm:w-12" })}</div>
    <span className="text-2xl sm:text-4xl font-bold leading-none">{count.toLocaleString()}</span>
    <div className="flex items-center justify-between w-full mt-1 sm:mt-2">
      <span className="text-xs sm:text-sm font-medium">{label}</span>
      <span className="text-[10px] sm:text-xs opacity-80 hover:opacity-100 cursor-pointer hidden sm:inline">view all ➕</span>
    </div>
  </button>
);

// Mini table with search toolbar
const DashboardTable: React.FC<{
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}> = ({ title, children, collapsible = true }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-gray-100">
        <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
        {collapsible && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => setCollapsed(!collapsed)}>
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      {!collapsed && (
        <CardContent className="p-0">
          <div className="flex items-center justify-end gap-1 p-3 border-b border-gray-50">
            <div className="relative">
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="h-7 w-36 text-xs border-gray-300" />
            </div>
            <Button variant="destructive" size="sm" className="h-7 w-7 p-0 bg-sky-500 hover:bg-sky-600"><X className="h-3 w-3" /></Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0"><RefreshCw className="h-3 w-3" /></Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0"><Download className="h-3 w-3" /></Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0"><Printer className="h-3 w-3" /></Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-sky-500 hover:bg-sky-600 text-white border-0"><Maximize2 className="h-3 w-3" /></Button>
          </div>
          {children}
          <div className="p-2 text-center">
            <Button variant="link" size="sm" className="text-xs text-white bg-sky-500 hover:bg-sky-600 w-full rounded h-7">View All</Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Activity icon map
const getActivityIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  switch (actionLower) {
    case 'update': return <Pencil className="h-3.5 w-3.5 text-muted-foreground" />;
    case 'checkout': return <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />;
    case 'audit': return <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />;
    default: return <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const getAssetDisplayName = (activity: AuditLog): string => {
  try {
    if (activity.details) {
      const details = JSON.parse(activity.details);
      if (details.assetName || details.asset_name) {
        return details.assetName || details.asset_name;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return activity.entityId ? `Asset #${activity.entityId}` : 'Asset';
};


export const AssetDashboard: React.FC = () => {
  const [assetCounts, setAssetCounts] = useState<Record<string, number>>({});
  const [assetStats, setAssetStats] = useState<Record<string, number>>({});
  const [assetsByCategory, setAssetsByCategory] = useState<Array<{ category: string; count: number }>>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [recentActivities, setRecentActivities] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [counts, stats, categories, employees, activities] = await Promise.all([
          assetApiService.getAssetCounts(),
          assetApiService.getAssetStats(),
          assetApiService.getAssetsByCategory(),
          hrApiService.listEmployees(),
          systemApiService.getAssetAuditLogs(5)
        ]);
        setAssetCounts(counts);
        setAssetStats(stats);
        setAssetsByCategory(categories);
        setTotalEmployees(Array.isArray(employees) ? employees.length : 0);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Failed to fetch asset data:', error);
      }
    };
    fetchData();
  }, []);

  const statusData = [
    { name: 'Ready to Deploy', value: assetCounts['ready-to-deploy'] || 0, color: '#10b981' },
    { name: 'Deployed', value: assetCounts['deployed'] || 0, color: '#3b82f6' },
    { name: 'Pending', value: assetCounts['pending'] || 0, color: '#f59e0b' },
    { name: 'Un-deployable', value: assetCounts['un-deployable'] || 0, color: '#ef4444' },
    { name: 'Archived', value: assetCounts['archived'] || 0, color: '#6b7280' },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
        {/* Big Button Status Cards - Snipe-IT style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          <StatusCard
            icon={<Package className="h-12 w-12" />}
            count={assetCounts['list-all'] || 0}
            label="Assets"
            bgClass="bg-sky-500"
          />
          <StatusCard
            icon={<KeyRound className="h-12 w-12" />}
            count={0}
            label="Licenses"
            bgClass="bg-emerald-500"
          />
          <StatusCard
            icon={<Keyboard className="h-12 w-12" />}
            count={0}
            label="Accessories"
            bgClass="bg-teal-500"
          />
          <StatusCard
            icon={<Droplets className="h-12 w-12" />}
            count={0}
            label="Consumables"
            bgClass="bg-amber-500"
          />
          <StatusCard
            icon={<Cpu className="h-12 w-12" />}
            count={0}
            label="Components"
            bgClass="bg-sky-600"
          />
          <StatusCard
            icon={<Users className="h-12 w-12" />}
            count={totalEmployees}
            label="People"
            bgClass="bg-rose-400"
          />
        </div>

        {/* Recent Activity + Assets by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="lg:col-span-3">
            <DashboardTable title="Recent Activity">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="text-xs font-semibold py-2 px-3 w-8"></TableHead>
                    <TableHead className="text-xs font-semibold py-2 px-3">Date</TableHead>
                    <TableHead className="text-xs font-semibold py-2 px-3">Created By</TableHead>
                    <TableHead className="text-xs font-semibold py-2 px-3">Action</TableHead>
                    <TableHead className="text-xs font-semibold py-2 px-3">Item</TableHead>
                    <TableHead className="text-xs font-semibold py-2 px-3">Target</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.length > 0 ? (
                    recentActivities.map(activity => (
                      <TableRow key={activity.id} className="border-b border-gray-50">
                        <TableCell className="py-2 px-3">{getActivityIcon(activity.action)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-sky-600 cursor-pointer hover:underline">
                          {activity.userName || activity.performedBy || 'System'}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs">{activity.action}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-sky-600 cursor-pointer hover:underline">
                          ║ {getAssetDisplayName(activity)}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-sky-600">
                          {activity.result || 'success'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-4 text-center text-xs text-gray-500">
                        No recent asset activities
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DashboardTable>
          </div>

          <div className="lg:col-span-2">
            <DashboardTable title="Assets by Status">
              <div className="p-4">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">No asset data available</div>
                )}
              </div>
            </DashboardTable>
          </div>
        </div>

        {/* Locations + Asset Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <DashboardTable title="Locations">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead className="text-xs font-semibold py-2 px-3">Name</TableHead>
                  <TableHead className="text-xs font-semibold py-2 px-3 text-center">║</TableHead>
                  <TableHead className="text-xs font-semibold py-2 px-3 text-center">Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDashboardLocations.slice(0, 8).map(loc => (
                  <TableRow key={loc.name} className="border-b border-gray-50">
                    <TableCell className="py-2 px-3 text-xs text-sky-600 cursor-pointer hover:underline">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-gray-400 inline-block" />
                        {loc.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs text-center">{loc.count}</TableCell>
                    <TableCell className="py-2 px-3 text-xs text-center">{loc.assigned}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardTable>

          <DashboardTable title="Asset Categories">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead className="text-xs font-semibold py-2 px-3">Name</TableHead>
                  <TableHead className="text-xs font-semibold py-2 px-3">Type</TableHead>
                  <TableHead className="text-xs font-semibold py-2 px-3 text-center">║</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assetsByCategory.map(cat => (
                  <TableRow key={cat.category} className="border-b border-gray-50">
                    <TableCell className="py-2 px-3 text-xs text-sky-600 cursor-pointer hover:underline">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                        {cat.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs">Asset</TableCell>
                    <TableCell className="py-2 px-3 text-xs text-center">{cat.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashboardTable>
        </div>
      </main>
    </div>
  );
};
