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
  DropdownModule,
  SpinnerModule,
  AlertModule,
  PaginationModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import {
  UsersService,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../services/users.service';
import { RolesService, Role } from '../../services/roles.service';

@Component({
  selector: 'app-users',
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
    PaginationModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  viewMode = signal<'grid' | 'list'>('list');
  searchTerm = signal('');
  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalUsers = signal(0);
  totalPages = signal(0);

  currentUser: Partial<
    CreateUserRequest & UpdateUserRequest & { _id?: string }
  > = {
    phoneNumber: '',
    roleId: '',
    isActive: true,
  };
  userToDelete: User | null = null;

  // Expose Math for template
  Math = Math;

  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set('');

    const search = this.searchTerm() || undefined;
    this.usersService
      .getAllUsers(this.currentPage(), this.pageSize(), search)
      .subscribe({
        next: (response) => {
          this.users.set(response.data);
          this.totalUsers.set(response.pagination.total);
          this.totalPages.set(response.pagination.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to load users');
        },
      });
  }

  loadRoles() {
    this.rolesService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles.filter((r) => r.isActive));
      },
      error: (err) => {
        console.error('Failed to load roles:', err);
      },
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  get filteredUsers() {
    return this.users();
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentUser = {
      phoneNumber: '',
      roleId: '',
      isActive: true,
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openEditModal(user: User) {
    this.isEditMode.set(true);
    this.currentUser = {
      _id: user._id,
      phoneNumber: user.phoneNumber,
      roleId: user.role?._id || '',
      isActive: user.isActive,
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(user: User) {
    this.userToDelete = user;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  formatRoleName(name: string): string {
    if (!name) return '';
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  saveUser() {
    this.error.set('');
    this.success.set('');

    if (!this.currentUser.phoneNumber || !this.currentUser.roleId) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentUser._id) {
      const updateData: UpdateUserRequest = {
        roleId: this.currentUser.roleId,
        isActive: this.currentUser.isActive,
      };
      this.usersService.updateUser(this.currentUser._id, updateData).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('User updated successfully');
          setTimeout(() => {
            this.closeModal();
            this.loadUsers();
          }, 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to update user');
        },
      });
    } else {
      const createData: CreateUserRequest = {
        phoneNumber: this.currentUser.phoneNumber!,
        roleId: this.currentUser.roleId!,
      };
      this.usersService.createUser(createData).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('User created successfully');
          setTimeout(() => {
            this.closeModal();
            this.loadUsers();
          }, 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create user');
        },
      });
    }
  }

  deleteUser() {
    if (!this.userToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.usersService.deleteUser(this.userToDelete._id).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('User deleted successfully');
        setTimeout(() => {
          this.closeDeleteModal();
          this.loadUsers();
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to delete user');
      },
    });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentUser = {
      phoneNumber: '',
      roleId: '',
      isActive: true,
    };
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.userToDelete = null;
    this.error.set('');
    this.success.set('');
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadUsers();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadUsers();
    }
  }
}
