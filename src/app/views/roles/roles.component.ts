import { Component, signal } from '@angular/core';
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
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  color: string;
  createdAt: string;
}

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
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent {
  roles = signal<Role[]>([
    {
      id: 1,
      name: 'Admin',
      description: 'Full system access with all permissions',
      userCount: 3,
      color: 'danger',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'User',
      description: 'Basic user access for standard operations',
      userCount: 45,
      color: 'info',
      createdAt: '2024-01-15',
    },
    {
      id: 3,
      name: 'Manager',
      description: 'Management access with team oversight',
      userCount: 12,
      color: 'warning',
      createdAt: '2024-02-01',
    },
    {
      id: 4,
      name: 'Developer',
      description: 'Technical access for development tasks',
      userCount: 8,
      color: 'success',
      createdAt: '2024-02-10',
    },
  ]);

  viewMode = signal<'grid' | 'list'>('grid');
  searchTerm = signal('');
  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  isEditMode = signal(false);

  currentRole: Role = {
    id: 0,
    name: '',
    description: '',
    userCount: 0,
    color: 'primary',
    createdAt: new Date().toISOString().split('T')[0],
  };
  roleToDelete: Role | null = null;

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
      id: 0,
      name: '',
      description: '',
      userCount: 0,
      color: 'primary',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.modalVisible.set(true);
  }

  openEditModal(role: Role) {
    this.isEditMode.set(true);
    this.currentRole = { ...role };
    this.modalVisible.set(true);
  }

  openDeleteModal(role: Role) {
    this.roleToDelete = role;
    this.deleteModalVisible.set(true);
  }

  saveRole() {
    if (this.isEditMode()) {
      this.roles.update((roles) =>
        roles.map((r) =>
          r.id === this.currentRole.id ? { ...this.currentRole } : r,
        ),
      );
    } else {
      const newId = Math.max(...this.roles().map((r) => r.id), 0) + 1;
      this.roles.update((roles) => [
        ...roles,
        { ...this.currentRole, id: newId },
      ]);
    }
    this.closeModal();
  }

  deleteRole() {
    if (this.roleToDelete) {
      this.roles.update((roles) =>
        roles.filter((r) => r.id !== this.roleToDelete!.id),
      );
      this.closeDeleteModal();
    }
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentRole = {
      id: 0,
      name: '',
      description: '',
      userCount: 0,
      color: 'primary',
      createdAt: new Date().toISOString().split('T')[0],
    };
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.roleToDelete = null;
  }
}
