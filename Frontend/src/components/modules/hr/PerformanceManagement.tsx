import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarIcon, Target, TrendingUp, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { hrApiService, PerformanceReview, User } from '@/services/javabackendapi/hrApi';
import { AddPerformanceReviewForm } from './forms/AddPerformanceReviewForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { mockMonthlyPerformance, mockKpiData } from '@/services/mockData/hr';

export const PerformanceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reviews, empList] = await Promise.all([
        hrApiService.getAllPerformanceReviews(),
        hrApiService.listEmployees()
      ]);
      setPerformanceReviews(reviews);
      setEmployees(empList);
    } catch (error) {
      console.error('Failed to load performance reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee ${employeeId}`;
  };

  const avgRating = performanceReviews.length > 0 
    ? (performanceReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / performanceReviews.length).toFixed(1)
    : '0.0';

  const topPerformers = performanceReviews.filter(r => r.rating >= 4.5).length;

  const ratingDistribution = [
    { rating: '5 Stars', count: performanceReviews.filter(r => r.rating >= 4.5).length },
    { rating: '4 Stars', count: performanceReviews.filter(r => r.rating >= 3.5 && r.rating < 4.5).length },
    { rating: '3 Stars', count: performanceReviews.filter(r => r.rating >= 2.5 && r.rating < 3.5).length },
    { rating: '2 Stars', count: performanceReviews.filter(r => r.rating >= 1.5 && r.rating < 2.5).length },
    { rating: '1 Star', count: performanceReviews.filter(r => r.rating < 1.5).length },
  ];

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex-1 flex flex-col p-6 bg-background">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Management</h1>
            <p className="text-muted-foreground">Track and manage employee performance and goals</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Performance Review
          </Button>
        </div>

        {/* Performance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
              <StarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating}/5.0</div>
              <p className="text-xs text-muted-foreground">+0.2 from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">{performanceReviews.length} reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topPerformers}</div>
              <p className="text-xs text-muted-foreground">4.5+ rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
            <TabsTrigger value="goals">Goals & Objectives</TabsTrigger>
            <TabsTrigger value="kpis">Key Performance Indicators</TabsTrigger>
            <TabsTrigger value="reports">Performance Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Reviews</CardTitle>
                <CardDescription>Manage employee performance reviews and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Review Period</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceReviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No performance reviews found
                        </TableCell>
                      </TableRow>
                    ) : (
                      performanceReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{getEmployeeName(review.employeeId)}</TableCell>
                          <TableCell>{new Date(review.reviewDate).toLocaleDateString()}</TableCell>
                          <TableCell>{getEmployeeName(review.reviewerId)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.rating}</span>
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(review.reviewDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="default">Completed</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Goals & Objectives</CardTitle>
                <CardDescription>Track progress on individual and team goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceReviews.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No goals and objectives to display
                    </div>
                  ) : (
                    performanceReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">{review.goals || 'No goals set'}</h3>
                            <p className="text-sm text-muted-foreground">{getEmployeeName(review.employeeId)}</p>
                          </div>
                          <Badge variant="default">Completed</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">{review.comments}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Monitor key metrics for employee performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceReviews.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No KPI data to display
                    </div>
                  ) : (
                    performanceReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-medium">{getEmployeeName(review.employeeId)}</h3>
                            <p className="text-sm text-muted-foreground">Performance Review</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{review.rating * 20}%</div>
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{review.comments}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Rating Distribution</CardTitle>
                  <CardDescription>Distribution of employee ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Performance Trend</CardTitle>
                  <CardDescription>Monthly average performance ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockMonthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgRating" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Average KPI scores across dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={mockKpiData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Employees with highest ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...performanceReviews]
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((review, index) => (
                        <div key={review.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{getEmployeeName(review.employeeId)}</div>
                              <div className="text-sm text-muted-foreground">Rating: {review.rating}/5.0</div>
                            </div>
                          </div>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddPerformanceReviewForm 
        open={showAddForm} 
        onOpenChange={setShowAddForm}
        onSuccess={loadData}
      />
    </div>
  );
};