import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.apiUrl;
  private tokenKey = environment.storage.tokenKey;

  isAuthenticated = signal(false);
  currentUser = signal<VerifyOtpResponse['user'] | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.checkAuth();
  }

  sendOtp(phoneNumber: string): Observable<SendOtpResponse> {
    return this.http.post<SendOtpResponse>(
      `${this.apiUrl}${environment.apiEndpoints.auth.sendOtp}`,
      { phoneNumber },
    );
  }

  verifyOtp(phoneNumber: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http
      .post<VerifyOtpResponse>(
        `${this.apiUrl}${environment.apiEndpoints.auth.verifyOtp}`,
        { phoneNumber, otp },
      )
      .pipe(
        tap((response) => {
          this.setToken(response.accessToken);
          this.setUser(response.user);
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }),
      );
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: VerifyOtpResponse['user']): void {
    localStorage.setItem(environment.storage.userKey, JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): VerifyOtpResponse['user'] | null {
    const userStr = localStorage.getItem(environment.storage.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private checkAuth(): void {
    const token = this.getToken();
    const user = this.getUser();
    if (token && user) {
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(environment.storage.userKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/phone-login']);
  }
}
