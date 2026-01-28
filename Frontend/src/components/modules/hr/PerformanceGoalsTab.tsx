import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerformanceReview } from '@/services/javabackendapi/hrApi';

interface PerformanceGoalsTabProps {
  reviews: PerformanceReview[];
  getEmployeeName: (id: number) => string;
}

export const PerformanceGoalsTab = ({ reviews, getEmployeeName }: PerformanceGoalsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Goals & Objectives</CardTitle>
        <CardDescription>Track progress on individual and team goals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No goals and objectives to display
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{review.goals || 'No goals set'}</h3>
                    <p className="text-sm text-muted-foreground">{getEmployeeName(review.employeeId)}</p>
                  </div>
                  <Badge variant="default">Completed</Badge>
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
