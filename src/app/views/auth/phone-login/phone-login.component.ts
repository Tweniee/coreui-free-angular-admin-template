import { Component, signal } from '@angular/core';
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
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { AuthService } from '../../../services/auth.service';

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
  ],
  templateUrl: './phone-login.component.html',
  styleUrls: ['./phone-login.component.scss'],
})
export class PhoneLoginComponent {
  step = signal<'phone' | 'otp'>('phone');
  phoneNumber = signal('');
  otp = signal(['', '', '', '', '', '']);
  loading = signal(false);
  error = signal('');
  countdown = signal(0);

  private countdownInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  formatPhoneNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('91')) {
      return '+' + cleaned;
    }
    if (cleaned.length === 10) {
      return '+91' + cleaned;
    }
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    return '+91' + cleaned;
  }

  sendOtp() {
    this.error.set('');
    const phone = this.phoneNumber();

    if (!phone || phone.length < 10) {
      this.error.set('Please enter a valid phone number');
      return;
    }

    this.loading.set(true);
    const formattedPhone = this.formatPhoneNumber(phone);

    this.authService.sendOtp(formattedPhone).subscribe({
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

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`,
      ) as HTMLInputElement;
      nextInput?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && newOtp.length === 6) {
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
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length === 6) {
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

    if (otpCode.length !== 6) {
      this.error.set('Please enter complete OTP');
      return;
    }

    this.loading.set(true);
    const formattedPhone = this.formatPhoneNumber(this.phoneNumber());

    this.authService.verifyOtp(formattedPhone, otpCode).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid OTP. Please try again.');
        this.otp.set(['', '', '', '', '', '']);
        const firstInput = document.getElementById('otp-0') as HTMLInputElement;
        firstInput?.focus();
      },
    });
  }

  resendOtp() {
    if (this.countdown() > 0) return;

    this.otp.set(['', '', '', '', '', '']);
    this.error.set('');
    this.sendOtp();
  }

  backToPhone() {
    this.step.set('phone');
    this.otp.set(['', '', '', '', '', '']);
    this.error.set('');
    this.stopCountdown();
  }

  private startCountdown() {
    this.countdown.set(30);
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
}
