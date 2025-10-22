import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  MapPin, 
  DollarSign, 
  Award, 
  Phone, 
  MessageSquare, 
  BookOpen, 
  Eye, 
  Users, 
  UserCheck, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  GraduationCap,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ApplicantCardProps {
  teacher: any;
  onCardClick: () => void;
  onStatusChange: (teacherId: string, newStatus: string, rate?: string) => void;
  onSendContract: (teacherId: string) => void;
  getStatusColor: (status: string) => string;
  getNextStatus: (status: string) => string;
  getInitials: (teacher: any) => string;
  isSendingContract?: boolean;
  isUpdatingStatus?: boolean;
}

export const ApplicantCard = ({
  teacher,
  onCardClick,
  onStatusChange,
  onSendContract,
  getStatusColor,
  getNextStatus,
  getInitials,
  isSendingContract = false,
  isUpdatingStatus = false,
}: ApplicantCardProps) => {
  const nextStatus = getNextStatus(teacher.status);

  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextStatus === 'Offer') {
      // Check if per_lesson_rate exists
      if (!teacher.per_lesson_rate || teacher.per_lesson_rate <= 0) {
        toast.error('Please set the per lesson rate first', {
          description: 'Click the card to open details and set the rate before making an offer.'
        });
        // Open the detail modal by triggering the card click
        onCardClick();
        return;
      }
      // If rate exists, proceed with status change
      onStatusChange(teacher.id, nextStatus, teacher.per_lesson_rate.toString());
    } else {
      onStatusChange(teacher.id, nextStatus);
    }
  };

  const getStatusActionButton = () => {
    if (teacher.status === 'Hired' || teacher.status === 'Rejected' || teacher.status === 'Deleted') {
      return null;
    }

    const getButtonProps = () => {
      switch (nextStatus) {
        case 'Screening':
          return { icon: <Eye className="h-4 w-4" />, text: 'Move to Screening', variant: 'default' as const };
        case 'Interview':
          return { icon: <Users className="h-4 w-4" />, text: 'Move to Interview', variant: 'default' as const };
        case 'Offer':
          return { icon: <CheckCircle className="h-4 w-4" />, text: 'Make Offer', variant: 'default' as const };
        case 'Pending For Signature':
          return { icon: <Send className="h-4 w-4" />, text: 'Send Contract', variant: 'default' as const };
        case 'Hired':
          return { icon: <UserCheck className="h-4 w-4" />, text: 'Mark as Hired', variant: 'default' as const };
        default:
          return { icon: <AlertCircle className="h-4 w-4" />, text: 'Update Status', variant: 'outline' as const };
      }
    };

    const buttonProps = getButtonProps();

    return (
      <Button
        size="sm"
        variant={buttonProps.variant}
        onClick={handleStatusChange}
        disabled={isUpdatingStatus}
        className="h-7 sm:h-8 text-xs px-2 sm:px-3"
      >
        <span className="flex items-center gap-1">
          {isUpdatingStatus ? (
            <>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Processing...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              {buttonProps.icon}
              <span className="hidden sm:inline">{buttonProps.text}</span>
              <span className="sm:hidden">{buttonProps.text.replace('Move to ', '').replace('Mark as ', '')}</span>
            </>
          )}
        </span>
      </Button>
    );
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary cursor-pointer hover:scale-[1.01] hover:border-l-primary/80 group"
      onClick={onCardClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Avatar Section - Smaller on mobile */}
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 sm:h-14 sm:w-14">
              <AvatarImage src={teacher.profile_image_url} />
              <AvatarFallback className="text-sm sm:text-lg font-semibold">
                {getInitials(teacher)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-semibold text-foreground truncate">
                  {teacher.profiles?.first_name} {teacher.profiles?.last_name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{teacher.profiles?.email}</span>
                </div>
              </div>
              <Badge className={`${getStatusColor(teacher.status)} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 whitespace-nowrap flex-shrink-0`}>
                {teacher.status}
              </Badge>
            </div>

            {/* Info Grid - Reduced on mobile */}
            <div className="flex flex-wrap gap-2 mb-2 text-xs">
              {/* Location - Always show */}
              {teacher.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{teacher.city}</span>
                </div>
              )}

              {/* Rate - Always show if available */}
              {teacher.per_lesson_rate && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">€{teacher.per_lesson_rate}</span>
                </div>
              )}

              {/* Education - Hidden on mobile */}
              {teacher.education && (
                <div className="hidden sm:flex items-center gap-1">
                  <GraduationCap className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{teacher.education}</span>
                </div>
              )}

              {/* Phone - Hidden on mobile */}
              {teacher.phone && (
                <div className="hidden sm:flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{teacher.phone}</span>
                </div>
              )}

              {/* Contract Sent At - Show for Pending For Signature status */}
              {teacher.status === 'Pending For Signature' && teacher.contract_sent_at && (
                <div className="flex items-center gap-1 text-primary">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate font-medium">
                    Sent {formatDistanceToNow(new Date(teacher.contract_sent_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            {/* Subjects - Simplified on mobile */}
            {teacher.teacher_subjects && teacher.teacher_subjects.length > 0 && (
              <div className="mb-2">
                {/* Mobile: Show only subject count */}
                <div className="sm:hidden flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3 flex-shrink-0" />
                  <span>{teacher.teacher_subjects.length} subject{teacher.teacher_subjects.length !== 1 ? 's' : ''}</span>
                </div>
                
                {/* Desktop: Show all subjects with levels */}
                <div className="hidden sm:block p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold">Subjects & Levels</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.teacher_subjects.map((ts: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded-md border text-xs">
                        <Badge variant="outline" className="text-[10px] font-medium px-1 py-0 h-auto">
                          {ts.subjects?.name}
                        </Badge>
                        {(ts.levels?.name || ts.level) && (
                          <Badge variant="secondary" className="text-[10px] font-medium px-1 py-0 h-auto">
                            {ts.levels?.name || ts.level}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Compact on mobile */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              {getStatusActionButton()}
              {teacher.status === 'Pending For Signature' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isSendingContract}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendContract(teacher.id);
                  }}
                  className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="ml-1">
                    {isSendingContract ? 'Sending...' : 'Resend'}
                  </span>
                </Button>
              )}
              {(teacher.status === 'New' || teacher.status === 'Screening' || teacher.status === 'Interview') && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(teacher.id, 'Rejected');
                  }}
                  className="h-7 sm:h-8 text-xs px-2 sm:px-3"
                >
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="ml-1">Reject</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

