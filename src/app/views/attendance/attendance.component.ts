import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  ModalModule,
  TableModule,
  BadgeModule,
  SpinnerModule,
  AlertModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import {
  AttendanceService,
  Attendance,
  UpdateAttendanceRequest,
} from '../../services/attendance.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    GridModule,
    TableModule,
    ButtonModule,
    ModalModule,
    FormModule,
    IconModule,
    BadgeModule,
    SpinnerModule,
    AlertModule,
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
})
export class AttendanceComponent implements OnInit {
  attendances = signal<Attendance[]>([]);
  searchTerm = signal('');
  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  currentPage = signal(1);
  pageSize = signal(10);
  totalAttendances = signal(0);
  totalPages = signal(0);

  startDate = signal('');
  endDate = signal('');

  currentAttendance: Partial<UpdateAttendanceRequest & { _id?: string }> = {
    checkOutTime: '',
    notes: '',
  };
  attendanceToDelete: Attendance | null = null;
  selectedAttendance: Attendance | null = null;

  Math = Math;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit() {
    this.loadAttendances();
  }

  loadAttendances() {
    this.loading.set(true);
    this.error.set('');

    const search = this.searchTerm();
    const start = this.startDate();
    const end = this.endDate();

    const request = search
      ? this.attendanceService.searchAttendances(
          search,
          this.currentPage(),
          this.pageSize(),
        )
      : this.attendanceService.getAllAttendances(
          this.currentPage(),
          this.pageSize(),
          start || undefined,
          end || undefined,
        );

    request.subscribe({
      next: (response) => {
        this.attendances.set(response.data);
        this.totalAttendances.set(response.pagination.total);
        this.totalPages.set(response.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load attendances');
      },
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadAttendances();
  }

  onDateFilterChange() {
    this.currentPage.set(1);
    this.loadAttendances();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
    this.loadAttendances();
  }

  get filteredAttendances() {
    return this.attendances();
  }

  openEditModal(attendance: Attendance) {
    this.selectedAttendance = attendance;
    this.currentAttendance = {
      _id: attendance._id,
      checkOutTime: attendance.checkOutTime
        ? new Date(attendance.checkOutTime).toISOString().slice(0, 16)
        : '',
      notes: attendance.notes || '',
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(attendance: Attendance) {
    this.attendanceToDelete = attendance;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  saveAttendance() {
    this.error.set('');
    this.success.set('');

    if (!this.currentAttendance._id) {
      this.error.set('Invalid attendance record');
      return;
    }

    this.loading.set(true);

    const updateData: UpdateAttendanceRequest = {
      checkOutTime: this.currentAttendance.checkOutTime || undefined,
      notes: this.currentAttendance.notes,
    };

    this.attendanceService
      .updateAttendance(this.currentAttendance._id, updateData)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Attendance updated successfully');
          setTimeout(() => {
            this.closeModal();
            this.loadAttendances();
          }, 1500);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to update attendance');
        },
      });
  }

  deleteAttendance() {
    if (!this.attendanceToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.attendanceService
      .deleteAttendance(this.attendanceToDelete._id)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Attendance deleted successfully');
          setTimeout(() => {
            this.closeDeleteModal();
            this.loadAttendances();
          }, 1500);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to delete attendance');
        },
      });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentAttendance = {
      checkOutTime: '',
      notes: '',
    };
    this.selectedAttendance = null;
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.attendanceToDelete = null;
    this.error.set('');
    this.success.set('');
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadAttendances();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadAttendances();
    }
  }

  getStatusBadge(attendance: Attendance): {
    color: string;
    text: string;
  } {
    if (attendance.checkOutTime) {
      return { color: 'success', text: 'Completed' };
    }
    return { color: 'warning', text: 'Active' };
  }

  getMemberStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      Active: 'success',
      Expired: 'danger',
      Suspended: 'warning',
      'No Subscription': 'secondary',
    };
    return colors[status] || 'secondary';
  }

  calculateDuration(checkIn: string, checkOut?: string): string {
    const checkInTime = new Date(checkIn);
    const checkOutTime = checkOut ? new Date(checkOut) : new Date();

    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getTodayAttendanceCount(): number {
    const today = new Date().toDateString();
    return this.attendances().filter(
      (a) => new Date(a.checkInTime).toDateString() === today,
    ).length;
  }

  getActiveSessionsCount(): number {
    return this.attendances().filter((a) => !a.checkOutTime).length;
  }

  getCompletedSessionsCount(): number {
    const today = new Date().toDateString();
    return this.attendances().filter(
      (a) => a.checkOutTime && new Date(a.checkInTime).toDateString() === today,
    ).length;
  }

  getPeakHours(): Array<{ hour: string; count: number; percentage: number }> {
    const hourCounts: { [key: string]: number } = {};
    const today = new Date().toDateString();

    this.attendances()
      .filter((a) => new Date(a.checkInTime).toDateString() === today)
      .forEach((a) => {
        const hour = new Date(a.checkInTime).getHours();
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        hourCounts[hourLabel] = (hourCounts[hourLabel] || 0) + 1;
      });

    const maxCount = Math.max(...Object.values(hourCounts), 1);

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour,
        count,
        percentage: (count / maxCount) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  getRecentCheckIns(): Attendance[] {
    return this.attendances()
      .sort(
        (a, b) =>
          new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime(),
      )
      .slice(0, 5);
  }

  getAverageDuration(): string {
    const completedSessions = this.attendances().filter((a) => a.checkOutTime);

    if (completedSessions.length === 0) {
      return '0h 0m';
    }

    const totalMinutes = completedSessions.reduce((sum, a) => {
      const checkIn = new Date(a.checkInTime);
      const checkOut = new Date(a.checkOutTime!);
      const diffMs = checkOut.getTime() - checkIn.getTime();
      return sum + Math.floor(diffMs / (1000 * 60));
    }, 0);

    const avgMinutes = Math.floor(totalMinutes / completedSessions.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  getLongestSession(): string {
    const completedSessions = this.attendances().filter((a) => a.checkOutTime);

    if (completedSessions.length === 0) {
      return '0h 0m';
    }

    const durations = completedSessions.map((a) => {
      const checkIn = new Date(a.checkInTime);
      const checkOut = new Date(a.checkOutTime!);
      return checkOut.getTime() - checkIn.getTime();
    });

    const maxDuration = Math.max(...durations);
    const hours = Math.floor(maxDuration / (1000 * 60 * 60));
    const minutes = Math.floor((maxDuration % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  getShortestSession(): string {
    const completedSessions = this.attendances().filter((a) => a.checkOutTime);

    if (completedSessions.length === 0) {
      return '0h 0m';
    }

    const durations = completedSessions.map((a) => {
      const checkIn = new Date(a.checkInTime);
      const checkOut = new Date(a.checkOutTime!);
      return checkOut.getTime() - checkIn.getTime();
    });

    const minDuration = Math.min(...durations);
    const hours = Math.floor(minDuration / (1000 * 60 * 60));
    const minutes = Math.floor((minDuration % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }
}
