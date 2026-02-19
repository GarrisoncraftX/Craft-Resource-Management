import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, KeyRound, Keyboard, Droplets, Cpu, Users, X, RefreshCw, Download, Printer, Maximize2, Minus, Pencil, RotateCcw, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { assetApiService } from '@/services/javabackendapi/assetApi';
import type { AssetStats, AssetCategory } from '@/types/javabackendapi/assetTypes';

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
    className={`${bgClass} rounded-lg p-4 text-white flex flex-col items-start justify-between min-h-[110px] w-full transition-all hover:opacity-90 hover:shadow-lg relative overflow-hidden`}
  >
    <div className="absolute right-2 top-2 opacity-20">{icon}</div>
    <span className="text-4xl font-bold leading-none">{count.toLocaleString()}</span>
    <div className="flex items-center justify-between w-full mt-2">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs opacity-80 hover:opacity-100 cursor-pointer">view all ➕</span>
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
  switch (action) {
    case 'update': return <Pencil className="h-3.5 w-3.5 text-muted-foreground" />;
    case 'checkout': return <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />;
    case 'audit': return <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />;
    default: return <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

// Mock activity data
const mockActivities = [
  { id: 1, date: 'Tue Feb 17, 2026 6:37AM', createdBy: 'Admin User', action: 'update', item: 'GSMR Handy #GSMR - GSMR', target: '' },
  { id: 2, date: 'Tue Feb 17, 2026 6:37AM', createdBy: 'Admin User', action: 'checkout', item: '#205390976 - Macbook Pro 13"', target: '📍 Gerlachbury' },
  { id: 3, date: 'Tue Feb 17, 2026 6:37AM', createdBy: 'Admin User', action: 'checkout', item: '#1460542631 - Macbook Pro 13"', target: '📍 Gerlachbury' },
  { id: 4, date: 'Tue Feb 17, 2026 6:37AM', createdBy: 'Admin User', action: 'checkout', item: '#247822320 - Macbook Pro 13"', target: '📍 Gerlachbury' },
  { id: 5, date: 'Tue Feb 17, 2026 6:35AM', createdBy: 'Admin User', action: 'audit', item: '#444620233 - iPhone 12', target: '' },
];

// Mock location data
const mockLocations = [
  { name: 'NL Leipzig', count: 2, assigned: 0 },
  { name: 'Damarisstad', count: 251, assigned: 0 },
  { name: 'Huelsborough', count: 236, assigned: 12 },
  { name: 'New Nils', count: 262, assigned: 12 },
  { name: 'North Derickfort', count: 231, assigned: 9 },
  { name: 'Gerlachbury', count: 289, assigned: 15 },
  { name: 'Port Elsie', count: 266, assigned: 11 },
  { name: 'Allanport', count: 261, assigned: 12 },
];

export const AssetDashboard: React.FC = () => {
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [assetsByCategory, setAssetsByCategory] = useState<AssetCategory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, categories] = await Promise.all([
          assetApiService.getAssetStats(),
          assetApiService.getAssetsByCategory(),
        ]);
        setAssetStats(stats);
        setAssetsByCategory(categories);
      } catch (error) {
        console.error('Failed to fetch asset data:', error);
      }
    };
    fetchData();
  }, []);

  if (!assetStats) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Big Button Status Cards - Snipe-IT style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatusCard
            icon={<Package className="h-12 w-12" />}
            count={2599}
            label="Assets"
            bgClass="bg-sky-500"
          />
          <StatusCard
            icon={<KeyRound className="h-12 w-12" />}
            count={50}
            label="Licenses"
            bgClass="bg-emerald-500"
          />
          <StatusCard
            icon={<Keyboard className="h-12 w-12" />}
            count={4}
            label="Accessories"
            bgClass="bg-teal-500"
          />
          <StatusCard
            icon={<Droplets className="h-12 w-12" />}
            count={3}
            label="Consumables"
            bgClass="bg-amber-500"
          />
          <StatusCard
            icon={<Cpu className="h-12 w-12" />}
            count={4}
            label="Components"
            bgClass="bg-sky-600"
          />
          <StatusCard
            icon={<Users className="h-12 w-12" />}
            count={2009}
            label="People"
            bgClass="bg-rose-400"
          />
        </div>

        {/* Recent Activity + Assets by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
                  {mockActivities.map(a => (
                    <TableRow key={a.id} className="border-b border-gray-50">
                      <TableCell className="py-2 px-3">{getActivityIcon(a.action)}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-gray-600">{a.date}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-sky-600 cursor-pointer hover:underline">{a.createdBy}</TableCell>
                      <TableCell className="py-2 px-3 text-xs">{a.action}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-sky-600 cursor-pointer hover:underline">║ {a.item}</TableCell>
                      <TableCell className="py-2 px-3 text-xs text-sky-600">{a.target}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardTable>
          </div>

          <div className="lg:col-span-2">
            <DashboardTable title="Assets by Status">
              <div className="p-4 text-sm text-muted-foreground text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Ready to Deploy</span>
                    <span className="font-semibold text-foreground">2,499</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Pending</span>
                    <span className="font-semibold text-foreground">50</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Archived</span>
                    <span className="font-semibold text-foreground">50</span>
                  </div>
                </div>
              </div>
            </DashboardTable>
          </div>
        </div>

        {/* Locations + Asset Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {mockLocations.map(loc => (
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
