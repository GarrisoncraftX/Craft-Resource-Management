import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { hrApiService, PerformanceReview, User } from '@/services/javabackendapi/hrApi';
import { AddPerformanceReviewForm } from './forms/AddPerformanceReviewForm';
import { PerformanceStats } from './PerformanceStats';
import { PerformanceReviewsTab } from './PerformanceReviewsTab';
import { PerformanceGoalsTab } from './PerformanceGoalsTab';
import { PerformanceKPIsTab } from './PerformanceKPIsTab';
import { PerformanceReportsTab } from './PerformanceReportsTab';

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



  return (
    <div className="min-h-screen flex-1 flex flex-col p-4 md:p-6 bg-background">
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Performance Management</h1>
            <p className="text-sm md:text-base text-muted-foreground">Track and manage employee performance and goals</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Performance Review
          </Button>
        </div>

        <PerformanceStats 
          avgRating={avgRating}
          totalReviews={performanceReviews.length}
          topPerformers={topPerformers}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-full min-w-max">
              <TabsTrigger value="reviews" className="flex-1 whitespace-nowrap">Reviews</TabsTrigger>
              <TabsTrigger value="goals" className="flex-1 whitespace-nowrap">Goals</TabsTrigger>
              <TabsTrigger value="kpis" className="flex-1 whitespace-nowrap">KPIs</TabsTrigger>
              <TabsTrigger value="reports" className="flex-1 whitespace-nowrap">Reports</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="reviews" className="mt-4">
            <PerformanceReviewsTab 
              reviews={performanceReviews}
              employees={employees}
              getEmployeeName={getEmployeeName}
            />
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            <PerformanceGoalsTab 
              reviews={performanceReviews}
              getEmployeeName={getEmployeeName}
            />
          </TabsContent>

          <TabsContent value="kpis" className="mt-4">
            <PerformanceKPIsTab 
              reviews={performanceReviews}
              getEmployeeName={getEmployeeName}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <PerformanceReportsTab 
              reviews={performanceReviews}
              getEmployeeName={getEmployeeName}
            />
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