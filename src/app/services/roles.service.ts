import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Role {
  _id?: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  userCount?: number;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  permissionId: string;
  name: string;
  action: string;
  code: string;
  description?: string;
  isGranted: boolean;
}

export interface ModulePermissions {
  moduleId: string;
  moduleName: string;
  moduleCode: string;
  moduleIcon?: string;
  moduleOrder: number;
  permissions: Permission[];
}

export interface RolePermissionsResponse {
  roleId: string;
  roleName: string;
  modules: ModulePermissions[];
}

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private apiUrl = `${environment.apiUrl}${environment.apiEndpoints.roles}`;
  private permissionsUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRolePermissions(roleId: string): Observable<RolePermissionsResponse> {
    return this.http.get<RolePermissionsResponse>(
      `${this.permissionsUrl}/role/${roleId}`,
    );
  }

  updateRolePermissions(
    roleId: string,
    permissionCodes: string[],
  ): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${roleId}`, {
      permissions: permissionCodes,
    });
  }
}
