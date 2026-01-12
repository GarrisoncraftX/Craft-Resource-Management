import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { planningApiService } from '@/services/nodejsbackendapi/planningApi';
import { StrategicGoalFormDialog } from './StrategicGoalFormDialog';
import { toast } from '@/hooks/use-toast';

export function StrategicGoalsManagement() {
  const [goals, setGoals] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const data = await planningApiService.getStrategicGoals();
      setGoals(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load goals', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (goal: any) => {
    try {
      await planningApiService.createStrategicGoal(goal);
      toast({ title: 'Success', description: 'Strategic goal created' });
      loadGoals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create goal', variant: 'destructive' });
    }
  };

  const handleAchieve = async (id: string) => {
    try {
      await planningApiService.achieveStrategicGoal(id);
      toast({ title: 'Success', description: 'Goal marked as achieved' });
      loadGoals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update goal', variant: 'destructive' });
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Strategic Goals</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = calculateProgress(goal.currentValue, goal.targetValue);
              return (
                <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{goal.title}</h3>
                        <Badge variant={goal.priority === 'high' || goal.priority === 'critical' ? 'destructive' : 'default'}>
                          {goal.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Category: {goal.category}</span>
                        <span className="text-gray-500">Target: {goal.targetDate}</span>
                      </div>
                    </div>
                    {goal.status !== 'achieved' && (
                      <Button size="sm" onClick={() => handleAchieve(goal.id)}>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Mark Achieved
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <StrategicGoalFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleCreate} />
    </Card>
  );
}
