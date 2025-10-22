import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserPlus, 
  FileText, 
  DollarSign, 
  Calendar, 
  Mail, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'application' | 'contract' | 'payment' | 'lesson' | 'email' | 'approval' | 'pending' | 'alert';
  title: string;
  description: string;
  time: string;
  user?: {
    name: string;
    initials: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
}

const activityData: ActivityItem[] = [
  {
    id: '1',
    type: 'application',
    title: 'New teacher application received',
    description: 'Sarah Johnson applied to teach Mathematics',
    time: '2 minutes ago',
    user: { name: 'Sarah Johnson', initials: 'SJ' },
    status: 'info'
  },
  {
    id: '2',
    type: 'contract',
    title: 'Contract signed',
    description: 'John Smith signed contract for English tutoring',
    time: '1 hour ago',
    user: { name: 'John Smith', initials: 'JS' },
    status: 'success'
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment received',
    description: '€150 payment from Emma Wilson',
    time: '3 hours ago',
    user: { name: 'Emma Wilson', initials: 'EW' },
    status: 'success'
  },
  {
    id: '4',
    type: 'lesson',
    title: 'Lesson completed',
    description: 'Mathematics lesson with Alex Brown completed',
    time: '5 hours ago',
    user: { name: 'Alex Brown', initials: 'AB' },
    status: 'success'
  },
  {
    id: '5',
    type: 'email',
    title: 'Email sent',
    description: 'Welcome email sent to new teacher',
    time: '1 day ago',
    status: 'info'
  },
  {
    id: '6',
    type: 'alert',
    title: 'Payment overdue',
    description: 'Payment from Mike Davis is 3 days overdue',
    time: '2 days ago',
    user: { name: 'Mike Davis', initials: 'MD' },
    status: 'error'
  }
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'application':
      return UserPlus;
    case 'contract':
      return FileText;
    case 'payment':
      return DollarSign;
    case 'lesson':
      return Calendar;
    case 'email':
      return Mail;
    case 'approval':
      return CheckCircle;
    case 'pending':
      return Clock;
    case 'alert':
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status?: ActivityItem['status']) => {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'error':
      return 'text-red-600 bg-red-50';
    case 'info':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription className="text-sm">
          Latest system activities and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activityData.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  getStatusColor(activity.status)
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {activity.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
