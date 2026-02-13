import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  SpinnerModule,
  AlertModule,
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  CardBodyComponent,
  InputGroupComponent,
  InputGroupTextDirective,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-phone-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    GridModule,
    ButtonModule,
    FormModule,
    IconModule,
    SpinnerModule,
    AlertModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardBodyComponent,
    InputGroupComponent,
    InputGroupTextDirective,
  ],
  templateUrl: './phone-login.component.html',
  styleUrls: ['./phone-login.component.scss'],
})
export class PhoneLoginComponent implements OnDestroy {
  step = signal<'phone' | 'otp'>('phone');
  phoneNumber = signal('');
  otp = signal(new Array(environment.otp.length).fill(''));
  loading = signal(false);
  error = signal('');
  countdown = signal(0);

  readonly otpLength = environment.otp.length;
  readonly resendTimeout = environment.otp.resendTimeout;

  private countdownInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  formatPhoneNumber(value: string): string {
    // Clean the input - remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');

    // Extract exactly 10 digits
    let phoneDigits = cleaned;
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      phoneDigits = cleaned.substring(2);
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      phoneDigits = cleaned.substring(1);
    } else if (cleaned.length === 10) {
      phoneDigits = cleaned;
    } else if (cleaned.length > 10) {
      phoneDigits = cleaned.slice(-10);
    }

    // Return formatted for display
    return '+91' + phoneDigits;
  }

  sendOtp() {
    this.error.set('');
    const phone = this.phoneNumber();
    const cleaned = phone.replace(/\D/g, '');

    if (!phone || cleaned.length < 10) {
      this.error.set('Please enter a valid 10-digit mobile number');
      return;
    }

    this.loading.set(true);

    // Extract exactly 10 digits for backend (no country code or prefix)
    let phoneToSend = cleaned;
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // Remove 91 prefix if present
      phoneToSend = cleaned.substring(2);
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      // Remove 0 prefix if present
      phoneToSend = cleaned.substring(1);
    } else if (cleaned.length === 10) {
      phoneToSend = cleaned;
    } else {
      // Take last 10 digits
      phoneToSend = cleaned.slice(-10);
    }

    // Send exactly 10 digits without any prefix (e.g., 7014545341)
    this.authService.sendOtp(phoneToSend).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('otp');
        this.startCountdown();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || 'Failed to send OTP. Please try again.',
        );
      },
    });
  }

  onOtpInput(index: number, event: any) {
    const value = event.target.value;

    if (value.length > 1) {
      event.target.value = value.slice(0, 1);
      return;
    }

    const newOtp = [...this.otp()];
    newOtp[index] = value;
    this.otp.set(newOtp);

    if (value && index < this.otpLength - 1) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`,
      ) as HTMLInputElement;
      nextInput?.focus();
    }

    if (
      newOtp.every((digit) => digit !== '') &&
      newOtp.length === this.otpLength
    ) {
      this.verifyOtp();
    }
  }

  onOtpKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otp()[index] && index > 0) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`,
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData
      .replace(/\D/g, '')
      .slice(0, this.otpLength)
      .split('');

    if (digits.length === this.otpLength) {
      this.otp.set(digits);
      digits.forEach((digit, index) => {
        const input = document.getElementById(
          `otp-${index}`,
        ) as HTMLInputElement;
        if (input) input.value = digit;
      });
      this.verifyOtp();
    }
  }

  verifyOtp() {
    this.error.set('');
    const otpCode = this.otp().join('');

    if (otpCode.length !== this.otpLength) {
      this.error.set('Please enter complete OTP');
      return;
    }

    this.loading.set(true);

    // Extract exactly 10 digits for backend
    const phone = this.phoneNumber();
    const cleaned = phone.replace(/\D/g, '');
    let phoneToSend = cleaned;

    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      phoneToSend = cleaned.substring(2);
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      phoneToSend = cleaned.substring(1);
    } else if (cleaned.length === 10) {
      phoneToSend = cleaned;
    } else {
      phoneToSend = cleaned.slice(-10);
    }

    // Send exactly 10 digits without any prefix
    this.authService.verifyOtp(phoneToSend, otpCode).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid OTP. Please try again.');
        this.otp.set(new Array(this.otpLength).fill(''));
        const firstInput = document.getElementById('otp-0') as HTMLInputElement;
        firstInput?.focus();
      },
    });
  }

  resendOtp() {
    if (this.countdown() > 0) return;

    this.otp.set(new Array(this.otpLength).fill(''));
    this.error.set('');
    this.sendOtp();
  }

  backToPhone() {
    this.step.set('phone');
    this.otp.set(new Array(this.otpLength).fill(''));
    this.error.set('');
    this.stopCountdown();
  }

  private startCountdown() {
    this.countdown.set(this.resendTimeout);
    this.countdownInterval = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        this.stopCountdown();
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  isOtpComplete(): boolean {
    return this.otp().every((digit) => digit !== '');
  }
}
