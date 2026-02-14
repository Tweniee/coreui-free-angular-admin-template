import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  phoneNumber: string;
  profile?: {
    fullName: string;
    email?: string;
    profilePhoto?: string;
  };
  role?: {
    _id: string;
    name: string;
  };
}

export interface Member {
  _id: string;
  memberCode: string;
  userId?: string;
}

export interface Trainer {
  _id: string;
  phoneNumber: string;
}

export interface AssignedBy {
  _id: string;
  phoneNumber: string;
}

// Unified Assignment interface for component use
export interface Assignment {
  _id?: string;
  member: User;
  trainer: User;
  assignedDate: string;
  endDate?: string | null;
  status: 'Active' | 'Completed' | 'Cancelled';
  notes?: string;
  assignedBy?: User;
  createdAt?: string;
  updatedAt?: string;
}

// Response for GET all assignments (with populated fields)
export interface AssignmentListItem {
  _id: string;
  memberCode: string;
  memberName: string;
  memberPhone: string;
  trainerName: string;
  trainerPhone: string;
  assignedDate: string;
  endDate?: string | null;
  status: 'Active' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

// Response for GET by trainer/member (with object references)
export interface AssignmentDetail {
  _id: string;
  memberId: Member;
  trainerId: Trainer;
  assignedBy: AssignedBy;
  assignedDate: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Response for POST/PUT operations
export interface AssignmentCreateResponse {
  _id: string;
  memberId: string | Member;
  trainerId: string | Trainer;
  assignedBy: string | AssignedBy;
  assignedDate: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentResponse {
  data: AssignmentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  cancelledAssignments: number;
  assignmentsByTrainer?: Array<{
    trainerId: string;
    trainerName: string;
    count: number;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class MemberTrainerAssignmentsService {
  private apiUrl = `${environment.apiUrl}/trainer-assignments`;
  private usersUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // GET all assignments with pagination
  getAssignments(
    page: number = 1,
    limit: number = 50,
    status?: string,
    trainerId?: string,
    memberId?: string,
  ): Observable<{
    data: Assignment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (trainerId) params = params.set('trainerId', trainerId);
    if (memberId) params = params.set('memberId', memberId);

    return this.http.get<AssignmentResponse>(this.apiUrl, { params }).pipe(
      map((response) => ({
        data: response.data.map((item) =>
          this.transformListItemToAssignment(item),
        ),
        pagination: response.pagination,
      })),
    );
  }

  // Helper to transform API response to component format
  private transformListItemToAssignment(item: AssignmentListItem): Assignment {
    return {
      _id: item._id,
      member: {
        _id: '', // Not provided in list response
        phoneNumber: item.memberPhone,
        profile: {
          fullName: item.memberName,
        },
      },
      trainer: {
        _id: '', // Not provided in list response
        phoneNumber: item.trainerPhone,
        profile: {
          fullName: item.trainerName,
        },
      },
      assignedDate: item.assignedDate,
      endDate: item.endDate,
      status: item.status,
      notes: item.notes,
      createdAt: item.createdAt,
    };
  }

  // POST - Create new assignment
  createAssignment(assignment: {
    memberId: string;
    trainerId: string;
    notes?: string;
  }): Observable<AssignmentCreateResponse> {
    return this.http.post<AssignmentCreateResponse>(this.apiUrl, assignment);
  }

  // PUT - Update assignment
  updateAssignment(
    id: string,
    assignment: Partial<{
      status: 'Active' | 'Completed' | 'Cancelled';
      notes: string;
    }>,
  ): Observable<AssignmentCreateResponse> {
    return this.http.put<AssignmentCreateResponse>(
      `${this.apiUrl}/${id}`,
      assignment,
    );
  }

  // DELETE - Delete assignment
  deleteAssignment(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // GET assignments by member
  getAssignmentsByMember(memberId: string): Observable<AssignmentDetail[]> {
    return this.http.get<AssignmentDetail[]>(
      `${this.apiUrl}/member/${memberId}`,
    );
  }

  // GET assignments by trainer
  getAssignmentsByTrainer(trainerId: string): Observable<AssignmentDetail[]> {
    return this.http.get<AssignmentDetail[]>(
      `${this.apiUrl}/trainer/${trainerId}`,
    );
  }

  getStats(): Observable<AssignmentStats> {
    return this.http.get<AssignmentStats>(`${this.apiUrl}/stats`);
  }

  getTrainers(): Observable<{ data: User[] }> {
    return this.http.get<{ data: User[] }>(`${this.usersUrl}/trainers`);
  }

  getMembers(): Observable<{ data: User[] }> {
    return this.http.get<{ data: User[] }>(`${this.usersUrl}/members`);
  }
}
