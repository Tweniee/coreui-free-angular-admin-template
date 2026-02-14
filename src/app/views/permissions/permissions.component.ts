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
import {
  RolesService,
  Role,
  RolePermissionsResponse,
  ModulePermissions,
  Permission,
} from '../../services/roles.service';

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
  selectedRoleId = signal<string>('');
  rolePermissions = signal<RolePermissionsResponse | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');

  // Define all possible CRUD+Export actions
  allActions = [
    { key: 'create', name: 'Create', icon: 'cilPlus' },
    { key: 'read', name: 'Read', icon: 'cilSearch' },
    { key: 'update', name: 'Update', icon: 'cilPencil' },
    { key: 'delete', name: 'Delete', icon: 'cilTrash' },
    { key: 'export', name: 'Export', icon: 'cilCloudDownload' },
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
        if (roles.length > 0) {
          this.selectedRoleId.set(roles[0]._id || '');
          this.loadRolePermissions(roles[0]._id || '');
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load roles');
      },
    });
  }

  loadRolePermissions(roleId: string) {
    if (!roleId) return;

    this.loading.set(true);
    this.error.set('');

    this.rolesService.getRolePermissions(roleId).subscribe({
      next: (data) => {
        // Ensure ALL modules have ALL 5 actions (create, read, update, delete, export)
        const actionOrder = ['create', 'read', 'update', 'delete', 'export'];

        const enhancedData = {
          ...data,
          modules: data.modules.map((module) => {
            // Create a map of existing permissions by action
            const permissionMap = new Map<string, Permission>();
            module.permissions.forEach((p) => {
              permissionMap.set(p.action.toLowerCase(), p);
            });

            // Ensure all 5 actions exist for every module
            const allPermissions = actionOrder.map((action) => {
              const existing = permissionMap.get(action);
              if (existing) {
                return existing;
              } else {
                // Create a placeholder permission for missing actions
                return {
                  permissionId: `${module.moduleId}-${action}`,
                  name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.moduleName}`,
                  action: action,
                  code: `${module.moduleCode}.${action}`,
                  description: `Ability to ${action} ${module.moduleName.toLowerCase()}`,
                  isGranted: false,
                };
              }
            });

            return {
              ...module,
              permissions: allPermissions,
            };
          }),
        };

        this.rolePermissions.set(enhancedData);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load permissions');
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

  formatModuleName(name: string): string {
    if (!name) return '';
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  onRoleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const roleId = select.value;
    this.selectedRoleId.set(roleId);
    this.loadRolePermissions(roleId);
  }

  onPermissionChange(permission: Permission, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    permission.isGranted = checkbox.checked;
  }

  selectAllForModule(module: ModulePermissions) {
    const allGranted = module.permissions.every((p) => p.isGranted);
    module.permissions.forEach((p) => {
      p.isGranted = !allGranted;
    });
  }

  isModuleFullySelected(module: ModulePermissions): boolean {
    return module.permissions.every((p) => p.isGranted);
  }

  isModulePartiallySelected(module: ModulePermissions): boolean {
    const granted = module.permissions.filter((p) => p.isGranted);
    return granted.length > 0 && granted.length < module.permissions.length;
  }

  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      create: 'cilPlus',
      read: 'cilSearch',
      view: 'cilSearch',
      update: 'cilPencil',
      delete: 'cilTrash',
      export: 'cilCloudDownload',
    };
    return iconMap[action.toLowerCase()] || 'cilCheckCircle';
  }

  getActionName(action: string): string {
    const nameMap: { [key: string]: string } = {
      create: 'Create',
      read: 'Read',
      view: 'Read',
      update: 'Update',
      delete: 'Delete',
      export: 'Export',
    };
    return nameMap[action.toLowerCase()] || action;
  }

  savePermissions() {
    const roleId = this.selectedRoleId();
    const permissions = this.rolePermissions();

    if (!roleId || !permissions) return;

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    // Collect all granted permission codes
    const grantedPermissions: string[] = [];
    permissions.modules.forEach((module) => {
      module.permissions.forEach((permission) => {
        if (permission.isGranted) {
          grantedPermissions.push(permission.code);
        }
      });
    });

    this.rolesService
      .updateRolePermissions(roleId, grantedPermissions)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set(
            `Permissions updated for ${this.formatRoleName(permissions.roleName)}`,
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
