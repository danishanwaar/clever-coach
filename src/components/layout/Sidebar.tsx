import { useState, useMemo, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  FileText, 
  DollarSign, 
  Mail, 
  Calendar,
  Settings,
  BarChart3,
  UserCheck,
  UserPlus,
  FileCheck,
  TrendingUp,
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  LogOut,
  Search,
  Clock,
  Activity
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = memo(function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const isAdmin = useAuthStore(state => state.isAdmin);
  const isTeacher = useAuthStore(state => state.isTeacher);
  const isStudent = useAuthStore(state => state.isStudent);
  const signOut = useAuthStore(state => state.signOut);
  const location = useLocation();

  const navigationItems = useMemo(() => {
    // Debug: Log current pathname
    console.log('Sidebar current pathname:', location.pathname);
    
    // Show default navigation while loading
    if (loading) {
      return [
        { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' },
        { name: 'Profile', href: '/profile', icon: User, current: location.pathname === '/profile' },
        { name: 'Settings', href: '/settings', icon: Settings, current: location.pathname === '/settings' },
      ];
    }

    if (isAdmin()) {
      return [
        { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' },
        { name: 'Teachers', href: '/teachers', icon: GraduationCap, current: location.pathname === '/teachers' },
        { name: 'Applicants', href: '/applicants', icon: UserPlus, current: location.pathname === '/applicants' },
        { name: 'Students', href: '/students', icon: Users, current: location.pathname === '/students' },
        { name: 'Dynamic Matcher', href: '/dynamic-matcher', icon: Search, current: location.pathname === '/dynamic-matcher' },
        { name: 'Contracts', href: '/contracts', icon: FileText, current: location.pathname === '/contracts' },
        { name: 'Lessons', href: '/lessons', icon: Calendar, current: location.pathname === '/lessons' },
        { name: 'Invoices', href: '/invoices', icon: DollarSign, current: location.pathname === '/invoices' },
        { name: 'Profile', href: '/profile', icon: User, current: location.pathname === '/profile' },
        { name: 'Settings', href: '/settings', icon: Settings, current: location.pathname === '/settings' },
      ];
    }
    
    if (isTeacher()) {
      return [
        { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' },
        { name: 'My Profile', href: '/teacher/profile', icon: User, current: location.pathname === '/teacher/profile' },
        { name: 'My Students', href: '/teacher/students', icon: Users, current: location.pathname === '/teacher/students' },
        { name: 'Time Logs', href: '/teacher/time-logs', icon: Clock, current: location.pathname === '/teacher/time-logs' },
        { name: 'Financials', href: '/teacher/financials', icon: DollarSign, current: location.pathname === '/teacher/financials' },
        { name: 'Documents', href: '/teacher/documents', icon: FileText, current: location.pathname === '/teacher/documents' },
        { name: 'Activity', href: '/teacher/activity', icon: Activity, current: location.pathname === '/teacher/activity' },
        { name: 'Progress Notes', href: '/teacher/progress-notes', icon: BookOpen, current: location.pathname === '/teacher/progress-notes' },
        { name: 'Settings', href: '/teacher/settings', icon: Settings, current: location.pathname === '/teacher/settings' },
      ];
    }
    
    if (isStudent()) {
      return [
        { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' },
        { name: 'Lessons', href: '/lessons', icon: Calendar, current: location.pathname === '/lessons' },
        { name: 'Contracts', href: '/contracts', icon: FileText, current: location.pathname === '/contracts' },
        { name: 'Profile', href: '/profile', icon: User, current: location.pathname === '/profile' },
        { name: 'Settings', href: '/settings', icon: Settings, current: location.pathname === '/settings' },
      ];
    }
    
    return [];
  }, [loading, isAdmin, isTeacher, isStudent, location.pathname]);

  return (
    <div className={cn(
      "flex flex-col h-full bg-primary transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-primary-foreground/20">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="relative">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
                <div className="absolute -bottom-1 -right-1">
                  <BookOpen className="w-3 h-3 text-primary-foreground/80" />
                </div>
                <div className="absolute -bottom-1 -left-1">
                  <Users className="w-3 h-3 text-primary-foreground/80" />
                </div>
              </div>
            </div>
            <div className="text-primary-foreground">
              <h1 className="text-lg font-bold tracking-wide">CLEVERCOACH</h1>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto">
            <div className="relative">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
              <div className="absolute -bottom-1 -right-1">
                <BookOpen className="w-3 h-3 text-primary-foreground/80" />
              </div>
              <div className="absolute -bottom-1 -left-1">
                <Users className="w-3 h-3 text-primary-foreground/80" />
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-primary-foreground hover:bg-primary-foreground/20 p-1"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={(e) => {
                console.log('Sidebar link clicked:', item.name, item.href);
                console.log('Current pathname:', location.pathname);
                console.log('Event:', e);
              }}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                item.current
                  ? "bg-primary-foreground/20 text-primary-foreground shadow-lg"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isCollapsed && "mx-auto")} />
              {!isCollapsed && <span>{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-primary-foreground/20">
        {!isCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto text-primary-foreground hover:bg-primary-foreground/20">
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-sm">
                      {user ? user.fld_name?.[0]?.toUpperCase() || 'U' : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">
                      {loading ? 'Loading...' : (user ? user.fld_name || 'User' : 'User')}
                    </p>
                    <p className="text-xs text-primary-foreground/70 truncate">
                      {loading ? 'Loading...' : (isAdmin() ? 'Administrator' : isTeacher() ? 'Teacher' : isStudent() ? 'Student' : 'User')}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {user ? user.fld_name || 'User' : 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.fld_email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {isAdmin() ? 'Administrator' : isTeacher() ? 'Teacher' : isStudent() ? 'Student' : 'User'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full p-2 text-primary-foreground hover:bg-primary-foreground/20">
                <Avatar className="h-8 w-8 mx-auto">
                  <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-sm">
                    {user ? user.fld_name?.[0]?.toUpperCase() || 'U' : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {user ? user.fld_name || 'User' : 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.fld_email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {isAdmin() ? 'Administrator' : isTeacher() ? 'Teacher' : isStudent() ? 'Student' : 'User'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
});
