import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface SendOtpResponse {
  message: string;
}

interface VerifyOtpResponse {
  accessToken: string;
  user: {
    _id: string;
    phoneNumber: string;
    role: {
      _id: string;
      name: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://10.100.71.172:3000';
  private tokenKey = 'accessToken';

  isAuthenticated = signal(false);
  currentUser = signal<VerifyOtpResponse['user'] | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.checkAuth();
  }

  sendOtp(phoneNumber: string): Observable<SendOtpResponse> {
    return this.http.post<SendOtpResponse>(`${this.apiUrl}/auth/send-otp`, {
      phoneNumber,
    });
  }

  verifyOtp(phoneNumber: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http
      .post<VerifyOtpResponse>(`${this.apiUrl}/auth/verify-otp`, {
        phoneNumber,
        otp,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.accessToken);
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }),
      );
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private checkAuth(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/phone-login']);
  }
}
