import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Attendance {
  _id: string;
  checkInTime: string;
  checkOutTime?: string;
  qrCode: string;
  notes?: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  user: {
    _id: string;
    phoneNumber: string;
  };
  profile: {
    _id: string;
    fullName: string;
    email?: string;
  };
  member: {
    _id: string;
    memberCode: string;
    status: string;
  };
}

export interface AttendanceResponse {
  data: Attendance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateAttendanceRequest {
  checkOutTime?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getAllAttendances(
    page: number = 1,
    limit: number = 10,
    startDate?: string,
    endDate?: string,
  ): Observable<AttendanceResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<AttendanceResponse>(this.apiUrl, { params });
  }

  searchAttendances(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<AttendanceResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<AttendanceResponse>(`${this.apiUrl}/search`, {
      params,
    });
  }

  getAttendanceById(id: string): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.apiUrl}/${id}`);
  }

  updateAttendance(
    id: string,
    data: UpdateAttendanceRequest,
  ): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.apiUrl}/${id}`, data);
  }

  deleteAttendance(
    id: string,
  ): Observable<{ message: string; deletedAttendanceId: string }> {
    return this.http.delete<{ message: string; deletedAttendanceId: string }>(
      `${this.apiUrl}/${id}`,
    );
  }
}
