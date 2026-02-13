import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  TableModule,
  BadgeModule,
  SpinnerModule,
  AlertModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { RolesService, Role } from '../../services/roles.service';

interface Module {
  name: string;
  key: string;
  icon: string;
}

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    GridModule,
    TableModule,
    ButtonModule,
    FormModule,
    IconModule,
    BadgeModule,
    SpinnerModule,
    AlertModule,
  ],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
})
export class PermissionsComponent implements OnInit {
  roles = signal<Role[]>([]);
  selectedRole = signal<Role | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');

  modules: Module[] = [
    { name: 'Members', key: 'members', icon: 'cilPeople' },
    { name: 'Workouts', key: 'workouts', icon: 'cilSpeedometer' },
    { name: 'Roles', key: 'roles', icon: 'cilShieldAlt' },
  ];

  crudOperations = [
    { name: 'Create', key: 'create', icon: 'cilPlus' },
    { name: 'Read', key: 'view', icon: 'cilSearch' },
    { name: 'Update', key: 'update', icon: 'cilPencil' },
    { name: 'Delete', key: 'delete', icon: 'cilTrash' },
  ];

  constructor(private rolesService: RolesService) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading.set(true);
    this.error.set('');

    this.rolesService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        if (roles.length > 0 && !this.selectedRole()) {
          this.selectedRole.set(roles[0]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load roles');
      },
    });
  }

  formatRoleName(name: string): string {
    if (!name) return '';
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  onRoleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const roleId = select.value;
    const role = this.roles().find((r) => r._id === roleId);
    if (role) {
      this.selectedRole.set(role);
    }
  }

  hasPermission(module: string, operation: string): boolean {
    const role = this.selectedRole();
    if (!role) return false;
    const permission = `${module}.${operation}`;
    return role.permissions?.includes(permission) || false;
  }

  togglePermission(module: string, operation: string) {
    const role = this.selectedRole();
    if (!role) return;

    const permission = `${module}.${operation}`;
    const permissions = role.permissions || [];
    const index = permissions.indexOf(permission);

    if (index > -1) {
      permissions.splice(index, 1);
    } else {
      permissions.push(permission);
    }

    role.permissions = [...permissions];
    this.selectedRole.set({ ...role });
  }

  selectAllForModule(module: string) {
    const role = this.selectedRole();
    if (!role) return;

    const modulePermissions = this.crudOperations.map(
      (op) => `${module}.${op.key}`,
    );
    const permissions = role.permissions || [];
    const allSelected = modulePermissions.every((p) => permissions.includes(p));

    if (allSelected) {
      // Deselect all
      role.permissions = permissions.filter(
        (p) => !modulePermissions.includes(p),
      );
    } else {
      // Select all
      const newPermissions = [...permissions];
      modulePermissions.forEach((p) => {
        if (!newPermissions.includes(p)) {
          newPermissions.push(p);
        }
      });
      role.permissions = newPermissions;
    }

    this.selectedRole.set({ ...role });
  }

  isModuleFullySelected(module: string): boolean {
    return this.crudOperations.every((op) =>
      this.hasPermission(module, op.key),
    );
  }

  isModulePartiallySelected(module: string): boolean {
    const selected = this.crudOperations.filter((op) =>
      this.hasPermission(module, op.key),
    );
    return selected.length > 0 && selected.length < this.crudOperations.length;
  }

  savePermissions() {
    const role = this.selectedRole();
    if (!role || !role._id) return;

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.rolesService
      .updateRole(role._id, { permissions: role.permissions })
      .subscribe({
        next: () => {
          // Update the role in the roles array
          this.roles.update((roles) =>
            roles.map((r) =>
              r._id === role._id ? { ...r, permissions: role.permissions } : r,
            ),
          );
          this.saving.set(false);
          this.success.set(
            `Permissions updated for ${this.formatRoleName(role.name)}`,
          );
          setTimeout(() => this.success.set(''), 3000);
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Failed to update permissions');
        },
      });
  }
}
