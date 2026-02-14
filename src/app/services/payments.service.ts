import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Payment {
  _id: string;
  userId: string;
  userName?: string;
  amount: number;
  paymentMode: string;
  status: string;
  transactionId?: string;
  description?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentsResponse {
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingAmount: number;
  paymentsByStatus: {
    [key: string]: number;
  };
  paymentsByMode: {
    [key: string]: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAllPayments(
    page: number = 1,
    limit: number = 50,
    status?: string,
    paymentMode?: string,
  ): Observable<PaymentsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    if (paymentMode) {
      params = params.set('paymentMode', paymentMode);
    }

    return this.http.get<PaymentsResponse>(this.apiUrl, { params });
  }

  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getPaymentsByUserId(userId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/user/${userId}`);
  }

  getPaymentStats(): Observable<PaymentStats> {
    return this.http.get<PaymentStats>(`${this.apiUrl}/stats`);
  }
}
