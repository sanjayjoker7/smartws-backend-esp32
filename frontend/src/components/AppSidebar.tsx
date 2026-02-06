import { LayoutDashboard, Trash2, Bell, LogOut, Recycle } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Waste Status', url: '/waste-status', icon: Trash2 },
  { title: 'Notification', url: '/notifications', icon: Bell },
];

export function AppSidebar() {
  const { logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
            <Recycle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">SmartWaste</h1>
            <p className="text-xs text-muted-foreground">IoT Detection System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            const isNotification = item.title === 'Notification';

            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                  <span className="font-medium">{item.title}</span>
                  {isNotification && unreadCount > 0 && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>
    </aside>
  );
}
