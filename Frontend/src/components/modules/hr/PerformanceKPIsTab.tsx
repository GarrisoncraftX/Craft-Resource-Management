import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceReview } from '@/services/javabackendapi/hrApi';

interface PerformanceKPIsTabProps {
  reviews: PerformanceReview[];
  getEmployeeName: (id: number) => string;
}

export const PerformanceKPIsTab = ({ reviews, getEmployeeName }: PerformanceKPIsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Performance Indicators</CardTitle>
        <CardDescription>Monitor key metrics for employee performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No KPI data to display
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="font-medium">{getEmployeeName(review.employeeId)}</h3>
                    <p className="text-sm text-muted-foreground">Performance Review</p>
                  </div>
                  <div className="text-left sm:text-right">
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
  );
};
