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
  SpinnerModule,
  AlertModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import {
  ExpensesService,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '../../services/expenses.service';

@Component({
  selector: 'app-expenses',
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
    SpinnerModule,
    AlertModule,
  ],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent implements OnInit {
  expenses = signal<Expense[]>([]);
  viewMode = signal<'grid' | 'list'>('list');
  searchTerm = signal('');
  modalVisible = signal(false);
  deleteModalVisible = signal(false);
  isEditMode = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');

  currentPage = signal(1);
  pageSize = signal(10);
  totalExpenses = signal(0);
  totalPages = signal(0);

  totalExpenseAmount = signal(0);
  expenseStats = signal<any>(null);

  categories = [
    'Equipment',
    'Maintenance',
    'Utilities',
    'Salaries',
    'Rent',
    'Supplies',
    'Marketing',
    'Other',
  ];
  paymentMethods = ['Cash', 'Online', 'Card'];

  currentExpense: Partial<
    CreateExpenseRequest & UpdateExpenseRequest & { _id?: string }
  > = {
    title: '',
    description: '',
    amount: 0,
    category: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    vendorName: '',
    referenceNo: '',
    receiptUrl: '',
  };
  expenseToDelete: Expense | null = null;

  Math = Math;

  constructor(private expensesService: ExpensesService) {}

  ngOnInit() {
    this.loadExpenses();
    this.loadStats();
  }

  loadExpenses() {
    this.loading.set(true);
    this.error.set('');

    const search = this.searchTerm();

    const request = search
      ? this.expensesService.searchExpenses(
          search,
          this.currentPage(),
          this.pageSize(),
        )
      : this.expensesService.getAllExpenses(
          this.currentPage(),
          this.pageSize(),
        );

    request.subscribe({
      next: (response) => {
        this.expenses.set(response.data);
        this.totalExpenses.set(response.pagination.total);
        this.totalPages.set(response.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load expenses');
      },
    });
  }

  loadStats() {
    this.expensesService.getExpenseStats().subscribe({
      next: (stats) => {
        this.expenseStats.set(stats);
        this.totalExpenseAmount.set(stats.totalExpense || 0);
      },
      error: (err: any) => {
        console.error('Failed to load expense stats:', err);
      },
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadExpenses();
  }

  get filteredExpenses() {
    return this.expenses();
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentExpense = {
      title: '',
      description: '',
      amount: 0,
      category: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      vendorName: '',
      referenceNo: '',
      receiptUrl: '',
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openEditModal(expense: Expense) {
    this.isEditMode.set(true);
    this.currentExpense = {
      _id: expense._id,
      title: expense.title,
      description: expense.description || '',
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.expenseDate.split('T')[0],
      paymentMethod: expense.paymentMethod,
      vendorName: expense.vendorName || '',
      referenceNo: expense.referenceNo || '',
      receiptUrl: expense.receiptUrl || '',
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(expense: Expense) {
    this.expenseToDelete = expense;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  saveExpense() {
    this.error.set('');
    this.success.set('');

    if (
      !this.currentExpense.title ||
      !this.currentExpense.amount ||
      !this.currentExpense.category
    ) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentExpense._id) {
      const updateData: UpdateExpenseRequest = {
        title: this.currentExpense.title,
        description: this.currentExpense.description,
        amount: this.currentExpense.amount,
        category: this.currentExpense.category,
        expenseDate: this.currentExpense.expenseDate,
        paymentMethod: this.currentExpense.paymentMethod,
        vendorName: this.currentExpense.vendorName,
        referenceNo: this.currentExpense.referenceNo,
        receiptUrl: this.currentExpense.receiptUrl,
      };
      this.expensesService
        .updateExpense(this.currentExpense._id, updateData)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.success.set('Expense updated successfully');
            setTimeout(() => {
              this.closeModal();
              this.loadExpenses();
              this.loadStats();
            }, 1500);
          },
          error: (err: any) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Failed to update expense');
          },
        });
    } else {
      const createData: CreateExpenseRequest = {
        title: this.currentExpense.title!,
        description: this.currentExpense.description,
        amount: this.currentExpense.amount!,
        category: this.currentExpense.category!,
        expenseDate: this.currentExpense.expenseDate!,
        paymentMethod: this.currentExpense.paymentMethod!,
        vendorName: this.currentExpense.vendorName,
        referenceNo: this.currentExpense.referenceNo,
        receiptUrl: this.currentExpense.receiptUrl,
      };
      this.expensesService.createExpense(createData).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Expense created successfully');
          setTimeout(() => {
            this.closeModal();
            this.loadExpenses();
            this.loadStats();
          }, 1500);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create expense');
        },
      });
    }
  }

  deleteExpense() {
    if (!this.expenseToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.expensesService.deleteExpense(this.expenseToDelete._id).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Expense deleted successfully');
        setTimeout(() => {
          this.closeDeleteModal();
          this.loadExpenses();
          this.loadStats();
        }, 1500);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to delete expense');
      },
    });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentExpense = {
      title: '',
      description: '',
      amount: 0,
      category: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      vendorName: '',
      referenceNo: '',
      receiptUrl: '',
    };
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.expenseToDelete = null;
    this.error.set('');
    this.success.set('');
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadExpenses();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadExpenses();
    }
  }

  getTotalAmount(): number {
    return this.expenses().reduce((sum, expense) => sum + expense.amount, 0);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      Equipment: 'primary',
      Maintenance: 'warning',
      Utilities: 'info',
      Salaries: 'danger',
      Rent: 'success',
      Supplies: 'secondary',
      Marketing: 'dark',
      Other: 'light',
    };
    return colors[category] || 'secondary';
  }

  getPaymentMethodColor(method: string): string {
    const colors: { [key: string]: string } = {
      Cash: 'success',
      Online: 'primary',
      Card: 'info',
    };
    return colors[method] || 'secondary';
  }

  getCurrentMonth(): string {
    return new Date().toLocaleDateString('en-US', { month: 'short' });
  }
}
