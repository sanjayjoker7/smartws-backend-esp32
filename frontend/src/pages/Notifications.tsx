import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Trash2, AlertTriangle } from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const binLabels = {
  wet: { label: 'Wet Waste Bin', icon: '💧', color: 'text-bin-wet bg-bin-wet/10 border-bin-wet/30' },
  reject: { label: 'Reject Waste Bin', icon: '📦', color: 'text-bin-reject bg-bin-reject/10 border-bin-reject/30' },
  recyclable: { label: 'Recyclable Bin', icon: '♻️', color: 'text-bin-recyclable bg-bin-recyclable/10 border-bin-recyclable/30' },
  hazardous: { label: 'Hazardous Bin', icon: '☢️', color: 'text-bin-hazardous bg-bin-hazardous/10 border-bin-hazardous/30' },
};

function NotificationCard({ notification, onMarkAsRead }: { notification: Notification; onMarkAsRead: () => void }) {
  const binInfo = binLabels[notification.binType];

  return (
    <div
      className={cn(
        'glass-card p-5 transition-all duration-300 border-l-4',
        !notification.read && 'border-l-destructive bg-destructive/5',
        notification.read && 'border-l-border opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center border',
          binInfo.color
        )}>
          <span className="text-2xl">{binInfo.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="font-semibold text-destructive">Critical Alert</span>
            {!notification.read && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
                New
              </span>
            )}
          </div>

          <p className="text-foreground font-medium">
            {binInfo.label} has reached <span className="text-destructive font-bold">{notification.fillPercentage}%</span> capacity
          </p>

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
            <span>•</span>
            <span>{notification.timestamp.toLocaleString()}</span>
          </div>
        </div>

        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAsRead}
            className="text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark read
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearNotifications}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Notification List */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <NotificationCard
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No Notifications</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You'll receive alerts here when any bin reaches a critical fill level (80% or above).
          </p>
        </div>
      )}

      {/* Info Card */}
      <div className="glass-card p-5 border-l-4 border-l-primary">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Automatic Monitoring</h4>
            <p className="text-sm text-muted-foreground">
              The system continuously monitors all bins and triggers notifications when any bin reaches 80% capacity.
              This helps ensure timely waste collection and prevents overflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
