import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, StarIcon } from 'lucide-react';
import { PerformanceReview, User } from '@/services/javabackendapi/hrApi';

interface PerformanceReviewsTabProps {
  reviews: PerformanceReview[];
  employees: User[];
  getEmployeeName: (id: number) => string;
}

export const PerformanceReviewsTab = ({ reviews, employees, getEmployeeName }: PerformanceReviewsTabProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Reviews</CardTitle>
        <CardDescription>Manage employee performance reviews and assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Review Period</TableHead>
                <TableHead className="hidden md:table-cell">Reviewer</TableHead>
                <TableHead>Overall Score</TableHead>
                <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No performance reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{getEmployeeName(review.employeeId)}</TableCell>
                    <TableCell>{new Date(review.reviewDate).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden md:table-cell">{getEmployeeName(review.reviewerId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.rating}</span>
                        <div className="hidden sm:flex">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(review.reviewDate).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">
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
        </div>
      </CardContent>
    </Card>
  );
};
