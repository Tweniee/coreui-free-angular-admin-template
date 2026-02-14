import { Component, signal, OnInit, computed } from '@angular/core';
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
  DropdownModule,
  SpinnerModule,
  AlertModule,
  AvatarModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import {
  MemberTrainerAssignmentsService,
  Assignment,
  User,
  AssignmentStats,
} from '../../services/member-trainer-assignments.service';

@Component({
  selector: 'app-member-trainer-assignments',
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
    DropdownModule,
    SpinnerModule,
    AlertModule,
    AvatarModule,
  ],
  templateUrl: './member-trainer-assignments.component.html',
  styleUrls: ['./member-trainer-assignments.component.scss'],
})
export class MemberTrainerAssignmentsComponent implements OnInit {
  assignments = signal<Assignment[]>([]);
  trainers = signal<User[]>([]);
  members = signal<User[]>([]);
  stats = signal<AssignmentStats | null>(null);

  viewMode = signal<'grid' | 'list'>('grid');
  searchTerm = signal('');
  statusFilter = signal<string>('');
  trainerFilter = signal<string>('');

  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  detailsModalVisible = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  currentPage = signal(1);
  pageSize = signal(50);
  totalAssignments = signal(0);
  totalPages = signal(0);

  currentAssignment: Partial<Assignment> = {
    member: {} as User,
    trainer: {} as User,
    assignedDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    notes: '',
  };
  selectedMemberId = '';
  selectedTrainerId = '';
  assignmentToDelete: Assignment | null = null;
  selectedAssignment: Assignment | null = null;

  Math = Math;

  constructor(private assignmentsService: MemberTrainerAssignmentsService) {}

  ngOnInit() {
    this.loadAssignments();
    this.loadTrainers();
    this.loadMembers();
    this.loadStats();
  }

  loadAssignments() {
    this.loading.set(true);
    this.error.set('');

    this.assignmentsService
      .getAssignments(
        this.currentPage(),
        this.pageSize(),
        this.statusFilter(),
        this.trainerFilter(),
      )
      .subscribe({
        next: (response) => {
          this.assignments.set(response.data);
          this.totalAssignments.set(response.pagination.total);
          this.totalPages.set(response.pagination.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to load assignments');
        },
      });
  }

  loadTrainers() {
    this.assignmentsService.getTrainers().subscribe({
      next: (response) => {
        this.trainers.set(response.data);
      },
      error: (err) => {
        console.error('Failed to load trainers:', err);
      },
    });
  }

  loadMembers() {
    this.assignmentsService.getMembers().subscribe({
      next: (response) => {
        this.members.set(response.data);
      },
      error: (err) => {
        console.error('Failed to load members:', err);
      },
    });
  }

  loadStats() {
    this.assignmentsService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      },
    });
  }

  get filteredAssignments() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.assignments();

    return this.assignments().filter(
      (assignment) =>
        assignment.member.profile?.fullName?.toLowerCase().includes(term) ||
        assignment.trainer.profile?.fullName?.toLowerCase().includes(term) ||
        assignment.member.phoneNumber.includes(term) ||
        assignment.trainer.phoneNumber.includes(term),
    );
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadAssignments();
  }

  clearFilters() {
    this.statusFilter.set('');
    this.trainerFilter.set('');
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadAssignments();
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentAssignment = {
      member: {} as User,
      trainer: {} as User,
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      notes: '',
    };
    this.selectedMemberId = '';
    this.selectedTrainerId = '';
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openEditModal(assignment: Assignment) {
    this.isEditMode.set(true);
    this.currentAssignment = { ...assignment };
    this.selectedMemberId = assignment.member._id;
    this.selectedTrainerId = assignment.trainer._id;
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(assignment: Assignment) {
    this.assignmentToDelete = assignment;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  openDetailsModal(assignment: Assignment) {
    this.selectedAssignment = assignment;
    this.detailsModalVisible.set(true);
  }

  saveAssignment() {
    this.error.set('');
    this.success.set('');

    if (!this.selectedMemberId || !this.selectedTrainerId) {
      this.error.set('Please select both member and trainer');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentAssignment._id) {
      const updateData: any = {
        status: this.currentAssignment.status,
        notes: this.currentAssignment.notes,
      };

      this.assignmentsService
        .updateAssignment(this.currentAssignment._id, updateData)
        .subscribe({
          next: (updatedAssignment) => {
            this.loadAssignments(); // Reload to get fresh data
            this.loading.set(false);
            this.success.set('Assignment updated successfully');
            this.loadStats();
            setTimeout(() => this.closeModal(), 1500);
          },
          error: (err) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Failed to update assignment');
          },
        });
    } else {
      const createData: any = {
        memberId: this.selectedMemberId,
        trainerId: this.selectedTrainerId,
        notes: this.currentAssignment.notes,
      };

      this.assignmentsService.createAssignment(createData).subscribe({
        next: (newAssignment) => {
          this.loadAssignments();
          this.loading.set(false);
          this.success.set('Assignment created successfully');
          this.loadStats();
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create assignment');
        },
      });
    }
  }

  deleteAssignment() {
    if (!this.assignmentToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.assignmentsService
      .deleteAssignment(this.assignmentToDelete._id)
      .subscribe({
        next: () => {
          this.assignments.update((assignments) =>
            assignments.filter((a) => a._id !== this.assignmentToDelete!._id),
          );
          this.loading.set(false);
          this.success.set('Assignment deleted successfully');
          this.loadStats();
          setTimeout(() => this.closeDeleteModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to delete assignment');
        },
      });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentAssignment = {
      member: {} as User,
      trainer: {} as User,
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      notes: '',
    };
    this.selectedMemberId = '';
    this.selectedTrainerId = '';
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.assignmentToDelete = null;
    this.error.set('');
    this.success.set('');
  }

  closeDetailsModal() {
    this.detailsModalVisible.set(false);
    this.selectedAssignment = null;
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadAssignments();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadAssignments();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  refreshData() {
    this.loadAssignments();
    this.loadStats();
  }
}
