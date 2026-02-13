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
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { RolesService, Role } from '../../services/roles.service';

@Component({
  selector: 'app-roles',
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
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  roles = signal<Role[]>([]);
  viewMode = signal<'grid' | 'list'>('grid');
  searchTerm = signal('');
  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  currentRole: Partial<Role> = {
    name: '',
    description: '',
    permissions: [],
    isActive: true,
    color: 'primary',
  };
  roleToDelete: Role | null = null;

  // Available permissions
  availablePermissions = [
    'members.view',
    'members.create',
    'members.update',
    'members.delete',
    'workouts.view',
    'workouts.create',
    'workouts.update',
    'workouts.delete',
    'roles.view',
    'roles.create',
    'roles.update',
    'roles.delete',
  ];

  constructor(private rolesService: RolesService) {}

  ngOnInit() {
    this.loadRoles();
  }

  // Icon and color mappings based on index
  private iconMap = [
    'cilShieldAlt',
    'cilStar',
    'cilUser',
    'cilPeople',
    'cilSettings',
    'cilLockLocked',
    'cilSpeedometer',
    'cilChart',
    'cilTask',
    'cilBell',
  ];

  private colorMap = [
    'primary',
    'success',
    'info',
    'warning',
    'danger',
    'secondary',
    'dark',
  ];

  loadRoles() {
    this.loading.set(true);
    this.error.set('');

    this.rolesService.getAllRoles().subscribe({
      next: (roles) => {
        // Assign icons and colors based on index
        const rolesWithMeta = roles.map((role, index) => ({
          ...role,
          icon: this.iconMap[index % this.iconMap.length],
          color: this.colorMap[index % this.colorMap.length],
          userCount: role.userCount || 0,
        }));
        this.roles.set(rolesWithMeta);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load roles');
      },
    });
  }

  get filteredRoles() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.roles();
    return this.roles().filter(
      (role) =>
        role.name.toLowerCase().includes(term) ||
        role.description.toLowerCase().includes(term),
    );
  }

  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentRole = {
      name: '',
      description: '',
      permissions: [],
      isActive: true,
      color: 'primary',
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openEditModal(role: Role) {
    this.isEditMode.set(true);
    this.currentRole = { ...role };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(role: Role) {
    this.roleToDelete = role;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  togglePermission(permission: string) {
    const permissions = this.currentRole.permissions || [];
    const index = permissions.indexOf(permission);

    if (index > -1) {
      permissions.splice(index, 1);
    } else {
      permissions.push(permission);
    }

    this.currentRole.permissions = [...permissions];
  }

  hasPermission(permission: string): boolean {
    return this.currentRole.permissions?.includes(permission) || false;
  }

  saveRole() {
    this.error.set('');
    this.success.set('');

    if (!this.currentRole.name || !this.currentRole.description) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentRole._id) {
      // Update existing role
      const { _id, icon, userCount, createdAt, updatedAt, ...updateData } =
        this.currentRole;
      this.rolesService.updateRole(_id, updateData).subscribe({
        next: (updatedRole) => {
          this.roles.update((roles) =>
            roles.map((r) =>
              r._id === updatedRole._id
                ? {
                    ...updatedRole,
                    icon: r.icon,
                    color: r.color,
                    userCount: r.userCount,
                  }
                : r,
            ),
          );
          this.loading.set(false);
          this.success.set('Role updated successfully');
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to update role');
        },
      });
    } else {
      // Create new role
      const { icon, userCount, createdAt, updatedAt, ...createData } =
        this.currentRole;
      this.rolesService.createRole(createData).subscribe({
        next: (newRole) => {
          const index = this.roles().length;
          const roleWithMeta = {
            ...newRole,
            icon: this.iconMap[index % this.iconMap.length],
            color: this.colorMap[index % this.colorMap.length],
            userCount: 0,
          };
          this.roles.update((roles) => [...roles, roleWithMeta]);
          this.loading.set(false);
          this.success.set('Role created successfully');
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create role');
        },
      });
    }
  }

  deleteRole() {
    if (!this.roleToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.rolesService.deleteRole(this.roleToDelete._id).subscribe({
      next: () => {
        this.roles.update((roles) =>
          roles.filter((r) => r._id !== this.roleToDelete!._id),
        );
        this.loading.set(false);
        this.success.set('Role deleted successfully');
        setTimeout(() => this.closeDeleteModal(), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to delete role');
      },
    });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentRole = {
      name: '',
      description: '',
      permissions: [],
      isActive: true,
      color: 'primary',
    };
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.roleToDelete = null;
    this.error.set('');
    this.success.set('');
  }
}
