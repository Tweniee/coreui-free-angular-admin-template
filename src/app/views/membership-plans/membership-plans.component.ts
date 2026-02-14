import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  ModalModule,
  TableModule,
  BadgeModule,
  DropdownModule,
  SpinnerModule,
  AlertModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import {
  MembershipPlansService,
  MembershipPlan,
} from '../../services/membership-plans.service';

@Component({
  selector: 'app-membership-plans',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    GridModule,
    TableModule,
    ButtonModule,
    ModalModule,
    FormModule,
    IconModule,
    BadgeModule,
    DropdownModule,
    SpinnerModule,
    AlertModule,
  ],
  templateUrl: './membership-plans.component.html',
  styleUrls: ['./membership-plans.component.scss'],
})
export class MembershipPlansComponent implements OnInit {
  plans = signal<MembershipPlan[]>([]);
  viewMode = signal<'grid' | 'list'>('grid');
  searchTerm = signal('');
  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  // For inline price per day editing
  editingPricePerDay = signal<string | null>(null);
  tempPricePerDay = signal<number>(0);

  currentPlan: Partial<MembershipPlan> = {
    planName: '',
    durationDays: 30,
    basePrice: 0,
    pricePerDay: 0,
  };
  planToDelete: MembershipPlan | null = null;

  constructor(private plansService: MembershipPlansService) {}

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.loading.set(true);
    this.error.set('');

    this.plansService.getAllPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load membership plans');
      },
    });
  }

  get filteredPlans() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.plans();
    return this.plans().filter((plan) =>
      plan.planName.toLowerCase().includes(term),
    );
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentPlan = {
      planName: '',
      durationDays: 30,
      basePrice: 0,
      pricePerDay: 0,
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openEditModal(plan: MembershipPlan) {
    this.isEditMode.set(true);
    this.currentPlan = { ...plan };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(plan: MembershipPlan) {
    this.planToDelete = plan;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  savePlan() {
    this.error.set('');
    this.success.set('');

    if (
      !this.currentPlan.planName ||
      !this.currentPlan.basePrice ||
      !this.currentPlan.durationDays
    ) {
      this.error.set('Please fill in all required fields');
      return;
    }

    // Validate price per day for edit mode
    if (this.isEditMode() && !this.currentPlan.pricePerDay) {
      this.error.set('Price per day is required');
      return;
    }

    // Auto-calculate price per day for new plans
    if (!this.isEditMode()) {
      this.currentPlan.pricePerDay = Number(
        (this.currentPlan.basePrice / this.currentPlan.durationDays).toFixed(2),
      );
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentPlan._id) {
      const { _id, createdAt, updatedAt, ...updateData } = this.currentPlan;
      this.plansService.updatePlan(_id, updateData).subscribe({
        next: (updatedPlan) => {
          this.plans.update((plans) =>
            plans.map((p) => (p._id === updatedPlan._id ? updatedPlan : p)),
          );
          this.loading.set(false);
          this.success.set('Plan updated successfully');
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to update plan');
        },
      });
    } else {
      const { createdAt, updatedAt, ...createData } = this.currentPlan;
      this.plansService.createPlan(createData).subscribe({
        next: (newPlan) => {
          this.plans.update((plans) => [...plans, newPlan]);
          this.loading.set(false);
          this.success.set('Plan created successfully');
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create plan');
        },
      });
    }
  }

  deletePlan() {
    if (!this.planToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.plansService.deletePlan(this.planToDelete._id).subscribe({
      next: () => {
        this.plans.update((plans) =>
          plans.filter((p) => p._id !== this.planToDelete!._id),
        );
        this.loading.set(false);
        this.success.set('Plan deleted successfully');
        setTimeout(() => this.closeDeleteModal(), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to delete plan');
      },
    });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentPlan = {
      planName: '',
      durationDays: 30,
      basePrice: 0,
      pricePerDay: 0,
    };
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.planToDelete = null;
    this.error.set('');
    this.success.set('');
  }

  getDurationText(days: number): string {
    if (days < 30) {
      return `${days} days`;
    } else if (days === 30) {
      return '1 month';
    } else if (days === 90) {
      return '3 months';
    } else if (days === 180) {
      return '6 months';
    } else if (days === 365) {
      return '1 year';
    } else {
      const months = Math.floor(days / 30);
      return `${months} months`;
    }
  }

  startEditingPricePerDay(planId: string, currentPrice: number) {
    this.editingPricePerDay.set(planId);
    this.tempPricePerDay.set(currentPrice);
  }

  cancelEditingPricePerDay() {
    this.editingPricePerDay.set(null);
    this.tempPricePerDay.set(0);
  }

  savePricePerDay(planId: string) {
    this.loading.set(true);
    this.error.set('');

    this.plansService
      .updatePlan(planId, { pricePerDay: this.tempPricePerDay() })
      .subscribe({
        next: (updatedPlan) => {
          this.plans.update((plans) =>
            plans.map((p) => (p._id === updatedPlan._id ? updatedPlan : p)),
          );
          this.loading.set(false);
          this.editingPricePerDay.set(null);
          this.success.set('Price per day updated successfully');
          setTimeout(() => this.success.set(''), 3000);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err.error?.message || 'Failed to update price per day',
          );
        },
      });
  }
}
