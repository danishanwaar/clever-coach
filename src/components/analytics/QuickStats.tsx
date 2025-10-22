import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Calendar,
  Target,
  Clock
} from 'lucide-react';

export function QuickStats() {
  const stats = [
    {
      title: 'Student Satisfaction',
      value: '4.8/5',
      change: 0.3,
      changeType: 'increase' as const,
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'Teacher Utilization',
      value: '87%',
      change: 5.2,
      changeType: 'increase' as const,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Lesson Success Rate',
      value: '94%',
      change: 2.1,
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Avg. Response Time',
      value: '2.3h',
      change: -0.5,
      changeType: 'decrease' as const,
      icon: Clock,
      color: 'text-emerald-600'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Performance Metrics</CardTitle>
        <CardDescription className="text-sm">
          Key performance indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </span>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="flex items-center">
                  <Badge 
                    variant={stat.changeType === 'increase' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(stat.change)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgressStats() {
  const progressData = [
    { label: 'Teacher Onboarding', value: 75, total: 100 },
    { label: 'Student Enrollment', value: 60, total: 80 },
    { label: 'Lesson Completion', value: 90, total: 120 },
    { label: 'Contract Processing', value: 85, total: 100 }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Progress Overview</CardTitle>
        <CardDescription className="text-sm">
          Current system performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {progressData.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">
                {item.value}/{item.total}
              </span>
            </div>
            <Progress 
              value={(item.value / item.total) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round((item.value / item.total) * 100)}% complete</span>
              <span>{item.total - item.value} remaining</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
