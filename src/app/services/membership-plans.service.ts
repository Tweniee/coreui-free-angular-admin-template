import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MembershipPlan {
  _id?: string;
  planName: string;
  durationDays: number;
  basePrice: number;
  pricePerDay: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MembershipPlansService {
  private apiUrl = `${environment.apiUrl}/plans`;

  constructor(private http: HttpClient) {}

  getAllPlans(): Observable<MembershipPlan[]> {
    return this.http.get<MembershipPlan[]>(this.apiUrl);
  }

  getPlanById(id: string): Observable<MembershipPlan> {
    return this.http.get<MembershipPlan>(`${this.apiUrl}/${id}`);
  }

  createPlan(plan: Partial<MembershipPlan>): Observable<MembershipPlan> {
    return this.http.post<MembershipPlan>(this.apiUrl, plan);
  }

  updatePlan(
    id: string,
    plan: Partial<MembershipPlan>,
  ): Observable<MembershipPlan> {
    return this.http.put<MembershipPlan>(`${this.apiUrl}/${id}`, plan);
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
