import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  TableModule,
  BadgeModule,
  SpinnerModule,
  AlertModule,
  ModalModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import {
  PaymentsService,
  Payment,
  PaymentStats,
} from '../../services/payments.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    GridModule,
    TableModule,
    ButtonModule,
    FormModule,
    IconModule,
    BadgeModule,
    SpinnerModule,
    AlertModule,
    ModalModule,
  ],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  payments = signal<Payment[]>([]);
  stats = signal<PaymentStats | null>(null);
  loading = signal(false);
  loadingStats = signal(false);
  error = signal('');
  selectedPayment = signal<Payment | null>(null);
  detailsModalVisible = signal(false);

  // Filters
  selectedStatus = signal<string>('');
  selectedPaymentMode = signal<string>('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(50);
  totalPayments = signal(0);
  totalPages = signal(0);

  // Expose Math for template
  Math = Math;

  // Filter options
  statusOptions = ['Paid', 'Pending', 'Partial', 'Failed'];
  paymentModeOptions = ['Cash', 'Online', 'Card', 'UPI', 'Bank Transfer'];

  constructor(private paymentsService: PaymentsService) {}

  ngOnInit() {
    this.loadPayments();
    this.loadStats();
  }

  loadPayments() {
    this.loading.set(true);
    this.error.set('');

    const status = this.selectedStatus() || undefined;
    const paymentMode = this.selectedPaymentMode() || undefined;

    this.paymentsService
      .getAllPayments(this.currentPage(), this.pageSize(), status, paymentMode)
      .subscribe({
        next: (response) => {
          this.payments.set(response.data);
          this.totalPayments.set(response.pagination.total);
          this.totalPages.set(response.pagination.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to load payments');
        },
      });
  }

  loadStats() {
    this.loadingStats.set(true);
    this.paymentsService.getPaymentStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loadingStats.set(false);
      },
      error: (err) => {
        this.loadingStats.set(false);
        console.error('Failed to load stats:', err);
      },
    });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadPayments();
  }

  clearFilters() {
    this.selectedStatus.set('');
    this.selectedPaymentMode.set('');
    this.currentPage.set(1);
    this.loadPayments();
  }

  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      paid: 'success',
      pending: 'warning',
      partial: 'info',
      failed: 'danger',
    };
    return statusMap[status.toLowerCase()] || 'secondary';
  }

  getPaymentModeIcon(mode: string): string {
    const iconMap: { [key: string]: string } = {
      cash: 'cilMoney',
      card: 'cilCreditCard',
      upi: 'cilMobile',
      online: 'cilGlobeAlt',
      bank: 'cilBank',
      'bank transfer': 'cilBank',
    };
    return iconMap[mode.toLowerCase()] || 'cilWallet';
  }

  openDetailsModal(payment: Payment) {
    this.selectedPayment.set(payment);
    this.detailsModalVisible.set(true);
  }

  closeDetailsModal() {
    this.detailsModalVisible.set(false);
    this.selectedPayment.set(null);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadPayments();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadPayments();
    }
  }

  refreshData() {
    this.loadPayments();
    this.loadStats();
  }
}
