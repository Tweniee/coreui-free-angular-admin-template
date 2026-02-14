import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  _id: string;
  fullName: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePhoto?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
}

export interface UserRole {
  _id: string;
  name: string;
}

export interface User {
  _id: string;
  phoneNumber: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  role?: UserRole;
  profile?: UserProfile;
}

export interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  phoneNumber: string;
  roleId: string;
}

export interface UpdateUserRequest {
  roleId?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Observable<UsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`);
  }
}
