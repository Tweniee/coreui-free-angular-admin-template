import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  icon: string;
  color: string;
  time: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>(
    this.getDummyNotifications(),
  );
  public notifications$: Observable<Notification[]> =
    this.notificationsSubject.asObservable();

  constructor() {}

  private getDummyNotifications(): Notification[] {
    return [
      {
        id: 1,
        title: 'New user registered',
        message: 'John Doe has registered to the system',
        icon: 'cilUserFollow',
        color: 'success',
        time: '2 minutes ago',
        read: false,
      },
      {
        id: 2,
        title: 'Payment received',
        message: 'Payment of $150 received from member #1234',
        icon: 'cilDollar',
        color: 'success',
        time: '15 minutes ago',
        read: false,
      },
      {
        id: 3,
        title: 'Membership expiring soon',
        message: '5 memberships will expire in 3 days',
        icon: 'cilWarning',
        color: 'warning',
        time: '1 hour ago',
        read: false,
      },
      {
        id: 4,
        title: 'Server maintenance',
        message: 'Scheduled maintenance tonight at 10 PM',
        icon: 'cilSpeedometer',
        color: 'info',
        time: '2 hours ago',
        read: true,
      },
      {
        id: 5,
        title: 'New attendance record',
        message: '25 members checked in today',
        icon: 'cilCheckCircle',
        color: 'primary',
        time: '3 hours ago',
        read: true,
      },
      {
        id: 6,
        title: 'Low stock alert',
        message: 'Protein powder inventory is running low',
        icon: 'cilWarning',
        color: 'warning',
        time: '5 hours ago',
        read: true,
      },
      {
        id: 7,
        title: 'New trainer assigned',
        message: 'Sarah Johnson has been assigned to 3 new members',
        icon: 'cilPeople',
        color: 'info',
        time: '1 day ago',
        read: true,
      },
      {
        id: 8,
        title: 'Monthly report ready',
        message: 'Your monthly performance report is now available',
        icon: 'cilChartPie',
        color: 'primary',
        time: '2 days ago',
        read: true,
      },
      {
        id: 9,
        title: 'Equipment maintenance due',
        message: 'Treadmill #3 requires scheduled maintenance',
        icon: 'cilSettings',
        color: 'danger',
        time: '3 days ago',
        read: true,
      },
      {
        id: 10,
        title: 'New class scheduled',
        message: 'Yoga class added for Saturday 9 AM',
        icon: 'cilCalendar',
        color: 'success',
        time: '4 days ago',
        read: true,
      },
    ];
  }

  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter((n) => !n.read).length;
  }

  markAsRead(id: number): void {
    const notifications = this.notificationsSubject.value.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    this.notificationsSubject.next(notifications);
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map((n) => ({
      ...n,
      read: true,
    }));
    this.notificationsSubject.next(notifications);
  }
}
