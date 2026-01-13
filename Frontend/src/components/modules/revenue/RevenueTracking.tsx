import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Target } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { fetchRevenueCollections } from '@/services/api';
import { mockRevenueStreams } from '@/services/mockData/revenue';

const revenueStreams = [
  {
    id: 1,
    source: 'Property Tax',
    budgeted: 850000,
    actual: 782000,
    variance: -68000,
    percentageComplete: 92,
    lastUpdated: '2024-01-15',
    status: 'On Track'
  },
  {
    id: 2,
    source: 'Business Permits',
    budgeted: 125000,
    actual: 142000,
    variance: 17000,
    percentageComplete: 114,
    lastUpdated: '2024-01-14',
    status: 'Ahead'
  },
  {
    id: 3,
    source: 'Utility Fees',
    budgeted: 320000,
    actual: 298000,
    variance: -22000,
    percentageComplete: 93,
    lastUpdated: '2024-01-16',
    status: 'On Track'
  },
  {
    id: 4,
    source: 'Development Fees',
    budgeted: 180000,
    actual: 156000,
    variance: -24000,
    percentageComplete: 87,
    lastUpdated: '2024-01-13',
    status: 'Behind'
  }
];

const monthlyRevenue = [
  { month: 'Jan', actual: 125000, budget: 130000, lastYear: 118000 },
  { month: 'Feb', actual: 142000, budget: 135000, lastYear: 128000 },
  { month: 'Mar', actual: 158000, budget: 150000, lastYear: 145000 },
  { month: 'Apr', actual: 172000, budget: 165000, lastYear: 152000 },
  { month: 'May', actual: 186000, budget: 175000, lastYear: 168000 },
  { month: 'Jun', actual: 195000, budget: 185000, lastYear: 175000 }
];

const revenueBySource = [
  { name: 'Property Tax', value: 45, amount: 782000, color: '#3b82f6' },
  { name: 'Business Permits', value: 25, amount: 435000, color: '#ef4444' },
  { name: 'Utility Fees', value: 20, amount: 348000, color: '#22c55e' },
  { name: 'Development Fees', value: 10, amount: 174000, color: '#f59e0b' }
];

const quarterlyComparison = [
  { quarter: 'Q1 2023', revenue: 425000 },
  { quarter: 'Q2 2023', revenue: 485000 },
  { quarter: 'Q3 2023', revenue: 510000 },
  { quarter: 'Q4 2023', revenue: 545000 },
  { quarter: 'Q1 2024', revenue: 525000 },
  { quarter: 'Q2 2024', revenue: 565000 }
];

const forecastData = [
  { month: 'Jul', actual: null, forecast: 205000, confidence: 85 },
  { month: 'Aug', actual: null, forecast: 218000, confidence: 82 },
  { month: 'Sep', actual: null, forecast: 195000, confidence: 79 },
  { month: 'Oct', actual: null, forecast: 225000, confidence: 76 },
  { month: 'Nov', actual: null, forecast: 210000, confidence: 73 },
  { month: 'Dec', actual: null, forecast: 245000, confidence: 70 }
];

export const RevenueTracking: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [revenueStreams, setRevenueStreams] = useState<any[]>(mockRevenueStreams);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const collections = await fetchRevenueCollections();
        if (Array.isArray(collections) && collections.length > 0) {
          // Aggregate collections by source
          const aggregated = collections.reduce((acc: any, c: any) => {
            const source = c.taxType || c.source || 'Other';
            if (!acc[source]) acc[source] = { source, actual: 0, count: 0 };
            acc[source].actual += Number(c.amount || 0);
            acc[source].count++;
            return acc;
          }, {});
          const streams = Object.values(aggregated).map((s: any, idx: number) => ({
            id: idx + 1,
            source: s.source,
            budgeted: s.actual * 1.1,
            actual: s.actual,
            variance: s.actual * 0.1,
            percentageComplete: 100,
            lastUpdated: new Date().toISOString().split('T')[0],
            status: 'On Track',
          }));
          if (streams.length > 0) setRevenueStreams(streams);
        }
      } catch (error) {
        console.warn('Failed to load revenue collections, using fallback', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ahead': return 'bg-green-500';
      case 'On Track': return 'bg-blue-500';
      case 'Behind': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalActual = revenueStreams.reduce((sum, stream) => sum + stream.actual, 0);
  const totalBudgeted = revenueStreams.reduce((sum, stream) => sum + stream.budgeted, 0);
  const totalVariance = totalActual - totalBudgeted;
  const overallPerformance = (totalActual / totalBudgeted) * 100;

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Revenue Tracking</h1>
            <p className="text-muted-foreground">Monitor and analyze revenue performance across all sources</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-blue-500 text-muted-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue YTD</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalActual.toLocaleString()}</div>
              <p className="text-xs opacity-80">
                {totalVariance >= 0 ? '+' : ''}{((totalVariance / totalBudgeted) * 100).toFixed(1)}% vs budget
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-500 text-muted-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Performance</CardTitle>
              <Target className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallPerformance.toFixed(1)}%</div>
              <p className="text-xs opacity-80">
                ${Math.abs(totalVariance).toLocaleString()} {totalVariance >= 0 ? 'over' : 'under'} budget
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500 text-muted-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs opacity-80">vs same period last year</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500 text-muted-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
              <BarChart3 className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs opacity-80">Average over 6 months</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Revenue Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                      <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                      <Bar dataKey="lastYear" fill="#22c55e" name="Last Year" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Revenue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={revenueBySource}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBySource.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Streams Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Streams Summary</CardTitle>
                <CardDescription>Performance overview of all revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueStreams.map((stream) => (
                    <div key={stream.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{stream.source}</div>
                          <div className="text-sm text-muted-foreground">
                            Last updated: {new Date(stream.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={getStatusColor(stream.status)}>
                          {stream.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${stream.actual.toLocaleString()} / ${stream.budgeted.toLocaleString()}
                        </div>
                        <div className={`text-sm ${stream.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stream.variance >= 0 ? '+' : ''}${stream.variance.toLocaleString()} ({stream.percentageComplete}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {revenueStreams.map((stream) => (
                <Card key={stream.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{stream.source}</CardTitle>
                    <Badge className={getStatusColor(stream.status)}>{stream.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Budgeted:</span>
                        <span className="font-medium">${stream.budgeted.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Actual:</span>
                        <span className="font-medium">${stream.actual.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Variance:</span>
                        <span className={`font-medium ${stream.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stream.variance >= 0 ? '+' : ''}${stream.variance.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{stream.percentageComplete}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(stream.percentageComplete, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends Analysis</CardTitle>
                <CardDescription>Historical performance and growth patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="2024 Actual" />
                    <Area type="monotone" dataKey="lastYear" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="2023 Actual" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quarterly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Performance Comparison</CardTitle>
                <CardDescription>Revenue growth over the past 6 quarters</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quarterlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Predicted revenue for the next 6 months with confidence intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={[...monthlyRevenue, ...forecastData]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" connectNulls={false} />
                    <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Forecast Confidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Forecast Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Forecast (6 months):</span>
                      <span className="font-bold">$1,298,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Monthly:</span>
                      <span className="font-bold">$216,333</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence Range:</span>
                      <span className="font-bold">70-85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Growth:</span>
                      <span className="font-bold text-green-600">+8.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Economic Conditions</span>
                      <Badge className="bg-yellow-500">Medium</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Seasonal Variations</span>
                      <Badge className="bg-green-500">Low</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Policy Changes</span>
                      <Badge className="bg-red-500">High</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Market Competition</span>
                      <Badge className="bg-yellow-500">Medium</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Revenue Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">96.2%</div>
                  <p className="text-sm text-muted-foreground">Collection efficiency rate</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Growth Momentum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">Strong</div>
                  <p className="text-sm text-muted-foreground">Based on 6-month trend</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Diversification Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">7.8/10</div>
                  <p className="text-sm text-muted-foreground">Revenue source diversity</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-green-700">Strong Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Business permit revenue exceeded budget by 14%, indicating strong economic activity.
                    </p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium text-yellow-700">Area for Improvement</h4>
                    <p className="text-sm text-muted-foreground">
                      Development fees are 13% below budget. Consider reviewing fee structure and approval processes.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-blue-700">Opportunity</h4>
                    <p className="text-sm text-muted-foreground">
                      Consistent growth trend suggests potential for increasing revenue targets by 5-8% next year.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};