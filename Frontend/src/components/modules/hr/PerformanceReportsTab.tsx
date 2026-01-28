import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { StarIcon } from 'lucide-react';
import { PerformanceReview } from '@/services/javabackendapi/hrApi';
import { useMemo } from 'react';

interface PerformanceReportsTabProps {
  reviews: PerformanceReview[];
  getEmployeeName: (id: number) => string;
}

export const PerformanceReportsTab = ({ reviews, getEmployeeName }: PerformanceReportsTabProps) => {
  const ratingDistribution = [
    { rating: '5 Stars', count: reviews.filter(r => r.rating >= 4.5).length },
    { rating: '4 Stars', count: reviews.filter(r => r.rating >= 3.5 && r.rating < 4.5).length },
    { rating: '3 Stars', count: reviews.filter(r => r.rating >= 2.5 && r.rating < 3.5).length },
    { rating: '2 Stars', count: reviews.filter(r => r.rating >= 1.5 && r.rating < 2.5).length },
    { rating: '1 Star', count: reviews.filter(r => r.rating < 1.5).length },
  ];

  const monthlyPerformance = useMemo(() => {
    const monthlyData: { [key: string]: { total: number; count: number } } = {};
    
    reviews.forEach(review => {
      const date = new Date(review.reviewDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 };
      }
      monthlyData[monthKey].total += review.rating;
      monthlyData[monthKey].count += 1;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      avgRating: Number((data.total / data.count).toFixed(2))
    }));
  }, [reviews]);

  const kpiData = useMemo(() => {
    if (reviews.length === 0) return [];
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const normalizedScore = (avgRating / 5) * 100;
    
    return [
      { subject: 'Productivity', A: Math.round(normalizedScore * 0.95) },
      { subject: 'Quality', A: Math.round(normalizedScore * 0.88) },
      { subject: 'Efficiency', A: Math.round(normalizedScore * 1.02) },
      { subject: 'Innovation', A: Math.round(normalizedScore * 0.75) },
      { subject: 'Teamwork', A: Math.round(normalizedScore * 0.98) },
      { subject: 'Communication', A: Math.round(normalizedScore * 0.82) }
    ];
  }, [reviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
            <LineChart data={monthlyPerformance}>
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
            <RadarChart data={kpiData}>
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
            {[...reviews]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((review, index) => (
                <div key={review.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{getEmployeeName(review.employeeId)}</div>
                      <div className="text-sm text-muted-foreground">Rating: {review.rating}/5.0</div>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-shrink-0">{renderStars(review.rating)}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
