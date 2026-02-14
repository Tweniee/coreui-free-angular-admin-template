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
  StaffService,
  Staff,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '../../services/staff.service';

@Component({
  selector: 'app-staff',
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
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss'],
})
export class StaffComponent implements OnInit {
  staff = signal<Staff[]>([]);
  viewMode = signal<'grid' | 'list'>('list');
  searchTerm = signal('');
  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  currentPage = signal(1);
  pageSize = signal(10);
  totalStaff = signal(0);
  totalPages = signal(0);

  roles = ['Trainer', 'Receptionist', 'Manager', 'Cleaner', 'Maintenance'];
  designations = [
    'Senior Trainer',
    'Junior Trainer',
    'Front Desk',
    'Gym Manager',
    'Assistant Manager',
    'Cleaning Staff',
    'Maintenance Staff',
  ];
  statuses = ['Active', 'On Leave', 'Resigned', 'Terminated'];

  currentStaff: Partial<
    CreateStaffRequest & UpdateStaffRequest & { _id?: string }
  > = {
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    designation: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    salary: 0,
    address: '',
    emergencyContact: '',
  };
  staffToDelete: Staff | null = null;

  Math = Math;

  constructor(private staffService: StaffService) {}

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.loading.set(true);
    this.error.set('');

    const search = this.searchTerm();

    const request = search
      ? this.staffService.searchStaff(
          search,
          this.currentPage(),
          this.pageSize(),
        )
      : this.staffService.getAllStaff(this.currentPage(), this.pageSize());

    request.subscribe({
      next: (response) => {
        this.staff.set(response.data);
        this.totalStaff.set(response.pagination.total);
        this.totalPages.set(response.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load staff');
      },
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadStaff();
  }

  get filteredStaff() {
    return this.staff();
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentStaff = {
      fullName: '',
      email: '',
      phoneNumber: '',
      role: '',
      designation: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      salary: 0,
      address: '',
      emergencyContact: '',
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openEditModal(staff: Staff) {
    this.isEditMode.set(true);
    this.currentStaff = {
      _id: staff._id,
      fullName: staff.fullName,
      email: staff.email || '',
      phoneNumber: staff.phoneNumber,
      role: staff.role,
      designation: staff.designation,
      dateOfJoining: staff.dateOfJoining.split('T')[0],
      salary: staff.salary,
      address: staff.address || '',
      emergencyContact: staff.emergencyContact || '',
      status: staff.status,
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(staff: Staff) {
    this.staffToDelete = staff;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  saveStaff() {
    this.error.set('');
    this.success.set('');

    if (
      !this.currentStaff.fullName ||
      !this.currentStaff.phoneNumber ||
      !this.currentStaff.role ||
      !this.currentStaff.designation
    ) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentStaff._id) {
      const updateData: UpdateStaffRequest = {
        fullName: this.currentStaff.fullName,
        email: this.currentStaff.email,
        phoneNumber: this.currentStaff.phoneNumber,
        role: this.currentStaff.role,
        designation: this.currentStaff.designation,
        dateOfJoining: this.currentStaff.dateOfJoining,
        salary: this.currentStaff.salary,
        address: this.currentStaff.address,
        emergencyContact: this.currentStaff.emergencyContact,
        status: this.currentStaff.status,
      };
      this.staffService
        .updateStaff(this.currentStaff._id, updateData)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.success.set('Staff updated successfully');
            setTimeout(() => {
              this.closeModal();
              this.loadStaff();
            }, 1500);
          },
          error: (err: any) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Failed to update staff');
          },
        });
    } else {
      const createData: CreateStaffRequest = {
        fullName: this.currentStaff.fullName!,
        email: this.currentStaff.email,
        phoneNumber: this.currentStaff.phoneNumber!,
        role: this.currentStaff.role!,
        designation: this.currentStaff.designation!,
        dateOfJoining: this.currentStaff.dateOfJoining!,
        salary: this.currentStaff.salary!,
        address: this.currentStaff.address,
        emergencyContact: this.currentStaff.emergencyContact,
      };
      this.staffService.createStaff(createData).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Staff created successfully');
          setTimeout(() => {
            this.closeModal();
            this.loadStaff();
          }, 1500);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create staff');
        },
      });
    }
  }

  deleteStaff() {
    if (!this.staffToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.staffService.deleteStaff(this.staffToDelete._id).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Staff deleted successfully');
        setTimeout(() => {
          this.closeDeleteModal();
          this.loadStaff();
        }, 1500);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to delete staff');
      },
    });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentStaff = {
      fullName: '',
      email: '',
      phoneNumber: '',
      role: '',
      designation: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      salary: 0,
      address: '',
      emergencyContact: '',
    };
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.staffToDelete = null;
    this.error.set('');
    this.success.set('');
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadStaff();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadStaff();
    }
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      Active: 'success',
      'On Leave': 'warning',
      Resigned: 'secondary',
      Terminated: 'danger',
    };
    return colors[status] || 'secondary';
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      Trainer: 'primary',
      Receptionist: 'info',
      Manager: 'success',
      Cleaner: 'secondary',
      Maintenance: 'warning',
    };
    return colors[role] || 'secondary';
  }

  getActiveStaffCount(): number {
    return this.staff().filter((s) => s.status === 'Active').length;
  }

  getTotalSalary(): number {
    return this.staff()
      .filter((s) => s.status === 'Active')
      .reduce((sum, s) => sum + s.salary, 0);
  }
}
