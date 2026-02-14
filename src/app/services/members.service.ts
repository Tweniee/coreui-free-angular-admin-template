import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MemberUser {
  _id: string;
  phoneNumber: string;
  isActive?: boolean;
}

export interface MemberProfile {
  _id: string;
  fullName: string;
  email?: string | null;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string | null;
}

export interface MemberPlan {
  _id: string;
  planName: string;
  durationDays: number;
  basePrice: number;
}

export interface MemberPayment {
  _id: string;
  paymentMode: string;
  amountPaid: number;
  paymentStatus: string;
  pendingAmount: number;
  paymentDate: string;
  referenceNo?: string;
}

export interface Member {
  _id: string;
  memberCode: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  daysLeft: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  user: MemberUser;
  profile: MemberProfile;
  plan: MemberPlan;
  payment: MemberPayment;
  createdBy?: {
    _id: string;
    phoneNumber: string;
  };
  isExistingUser?: boolean;
}

export interface MembersResponse {
  data: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateMemberRequest {
  mobileNumber: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  durationDays: number;
  discountAmount?: number;
  paymentMode: string;
  referenceNo?: string;
}

export interface UpdateMemberRequest {
  fullName?: string;
  durationDays?: number;
  discountAmount?: number;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) {}

  getAllMembers(
    page: number = 1,
    limit: number = 10,
  ): Observable<MembersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<MembersResponse>(this.apiUrl, { params });
  }

  searchMembers(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<MembersResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<MembersResponse>(`${this.apiUrl}/search`, { params });
  }

  getMemberById(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  createMember(member: CreateMemberRequest): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member);
  }

  updateMember(id: string, member: UpdateMemberRequest): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, member);
  }

  deleteMember(
    id: string,
  ): Observable<{ message: string; deletedMemberId: string }> {
    return this.http.delete<{ message: string; deletedMemberId: string }>(
      `${this.apiUrl}/${id}`,
    );
  }
}
