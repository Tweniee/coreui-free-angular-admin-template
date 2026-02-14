import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Staff {
  _id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: string;
  designation: string;
  dateOfJoining: string;
  salary: number;
  address?: string;
  emergencyContact?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffResponse {
  data: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateStaffRequest {
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: string;
  designation: string;
  dateOfJoining: string;
  salary: number;
  address?: string;
  emergencyContact?: string;
}

export interface UpdateStaffRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  designation?: string;
  dateOfJoining?: string;
  salary?: number;
  address?: string;
  emergencyContact?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private apiUrl = `${environment.apiUrl}/staff`;

  constructor(private http: HttpClient) {}

  getAllStaff(page: number = 1, limit: number = 10): Observable<StaffResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<StaffResponse>(this.apiUrl, { params });
  }

  searchStaff(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<StaffResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<StaffResponse>(`${this.apiUrl}/search`, { params });
  }

  getStaffById(id: string): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiUrl}/${id}`);
  }

  createStaff(staff: CreateStaffRequest): Observable<Staff> {
    return this.http.post<Staff>(this.apiUrl, staff);
  }

  updateStaff(id: string, staff: UpdateStaffRequest): Observable<Staff> {
    return this.http.put<Staff>(`${this.apiUrl}/${id}`, staff);
  }

  deleteStaff(
    id: string,
  ): Observable<{ message: string; deletedStaffId: string }> {
    return this.http.delete<{ message: string; deletedStaffId: string }>(
      `${this.apiUrl}/${id}`,
    );
  }
}
