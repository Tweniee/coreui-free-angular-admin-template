import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  ButtonDirective,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  BadgeComponent,
  RowComponent,
  ColComponent,
  ButtonGroupComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import {
  NotificationService,
  Notification,
} from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    FormControlDirective,
    FormDirective,
    FormLabelDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    BadgeComponent,
    IconDirective,
    RowComponent,
    ColComponent,
    ButtonGroupComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notificationService = inject(NotificationService);

  allNotifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  searchTerm: string = '';
  filterType: 'all' | 'unread' | 'read' = 'all';

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.notifications$.subscribe((notifications) => {
      this.allNotifications = notifications;
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = [...this.allNotifications];

    // Apply read/unread filter
    if (this.filterType === 'unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (this.filterType === 'read') {
      filtered = filtered.filter((n) => n.read);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.message.toLowerCase().includes(search),
      );
    }

    this.filteredNotifications = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  setFilter(type: 'all' | 'unread' | 'read') {
    this.filterType = type;
    this.applyFilters();
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  getUnreadCount(): number {
    return this.notificationService.getUnreadCount();
  }
}
