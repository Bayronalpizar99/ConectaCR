import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Notification } from '../types';
import { notificationService } from '../services/notification.service';
import { cn } from './ui/utils';

interface NotificationsPopoverProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationsPopover({ userId, onNotificationClick }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        // Optimistic update
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchNotifications();
    }} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} nuevas
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-accent",
                    !notification.read && "bg-accent/50 font-medium"
                  )}
                  onSelect={(e) => {
                    e.preventDefault();
                    handleMarkAsRead(notification);
                    if (onNotificationClick) {
                      onNotificationClick(notification);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-none">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Nueva</span>
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
