import { useState, ReactNode, memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = memo(function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = useMemo(() => {
    return () => {
      setSidebarCollapsed(!sidebarCollapsed);
    };
  }, [sidebarCollapsed]);

  // Don't show sidebar for auth pages
  const isAuthPage = useMemo(() => {
    return location.pathname.startsWith('/auth');
  }, [location.pathname]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={cn(
          "hidden lg:flex flex-col transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            onToggle={toggleSidebar} 
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar 
            onMenuToggle={toggleSidebar}
            isSidebarCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar} />
          <div className="fixed left-0 top-0 h-full w-64">
            <Sidebar 
              isCollapsed={false} 
              onToggle={toggleSidebar} 
            />
          </div>
        </div>
      )}
    </div>
  );
});
