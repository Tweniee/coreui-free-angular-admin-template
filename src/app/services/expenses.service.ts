import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  expenseDate: string;
  paymentMethod: string;
  vendorName?: string;
  referenceNo?: string;
  receiptUrl?: string;
  isActive: boolean;
  createdBy?: {
    _id: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ExpensesResponse {
  data: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: string;
  expenseDate: string;
  paymentMethod: string;
  vendorName?: string;
  referenceNo?: string;
  receiptUrl?: string;
}

export interface UpdateExpenseRequest {
  title?: string;
  description?: string;
  amount?: number;
  category?: string;
  expenseDate?: string;
  paymentMethod?: string;
  vendorName?: string;
  referenceNo?: string;
  receiptUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getAllExpenses(
    page: number = 1,
    limit: number = 10,
    category?: string,
    startDate?: string,
    endDate?: string,
  ): Observable<ExpensesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (category) {
      params = params.set('category', category);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ExpensesResponse>(this.apiUrl, { params });
  }

  getExpenseStats(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }

  searchExpenses(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<ExpensesResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ExpensesResponse>(`${this.apiUrl}/search`, { params });
  }

  getExpenseById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  createExpense(expense: CreateExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  updateExpense(
    id: string,
    expense: UpdateExpenseRequest,
  ): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(
    id: string,
  ): Observable<{ message: string; deletedExpenseId: string }> {
    return this.http.delete<{ message: string; deletedExpenseId: string }>(
      `${this.apiUrl}/${id}`,
    );
  }
}
