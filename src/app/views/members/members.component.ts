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
  MembersService,
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
} from '../../services/members.service';
import {
  MembershipPlansService,
  MembershipPlan,
} from '../../services/membership-plans.service';

@Component({
  selector: 'app-members',
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
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit {
  members = signal<Member[]>([]);
  membershipPlans = signal<MembershipPlan[]>([]);
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
  totalMembers = signal(0);
  totalPages = signal(0);

  currentMember: Partial<
    CreateMemberRequest & UpdateMemberRequest & { _id?: string }
  > = {
    mobileNumber: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    durationDays: 0,
    discountAmount: 0,
    paymentMode: 'Cash',
    referenceNo: '',
  };
  memberToDelete: Member | null = null;

  Math = Math;

  constructor(
    private membersService: MembersService,
    private membershipPlansService: MembershipPlansService,
  ) {}

  ngOnInit() {
    this.loadMembers();
    this.loadMembershipPlans();
  }

  loadMembers() {
    this.loading.set(true);
    this.error.set('');

    const search = this.searchTerm();

    const request = search
      ? this.membersService.searchMembers(
          search,
          this.currentPage(),
          this.pageSize(),
        )
      : this.membersService.getAllMembers(this.currentPage(), this.pageSize());

    request.subscribe({
      next: (response) => {
        this.members.set(response.data);
        this.totalMembers.set(response.pagination.total);
        this.totalPages.set(response.pagination.totalPages);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to load members');
      },
    });
  }

  loadMembershipPlans() {
    this.membershipPlansService.getAllPlans().subscribe({
      next: (plans: MembershipPlan[]) => {
        this.membershipPlans.set(plans);
      },
      error: (err: any) => {
        console.error('Failed to load membership plans:', err);
      },
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadMembers();
  }

  get filteredMembers() {
    return this.members();
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.currentMember = {
      mobileNumber: '',
      fullName: '',
      gender: '',
      dateOfBirth: '',
      durationDays: 0,
      discountAmount: 0,
      paymentMode: 'Cash',
      referenceNo: '',
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openEditModal(member: Member) {
    this.isEditMode.set(true);
    this.currentMember = {
      _id: member._id,
      fullName: member.profile.fullName,
      durationDays: member.durationDays,
      discountAmount: member.discountAmount,
      status: member.status,
    };
    this.error.set('');
    this.success.set('');
    this.modalVisible.set(true);
  }

  openDeleteModal(member: Member) {
    this.memberToDelete = member;
    this.error.set('');
    this.success.set('');
    this.deleteModalVisible.set(true);
  }

  saveMember() {
    this.error.set('');
    this.success.set('');

    if (this.isEditMode()) {
      if (!this.currentMember.fullName) {
        this.error.set('Please fill in all required fields');
        return;
      }
    } else {
      if (
        !this.currentMember.mobileNumber ||
        !this.currentMember.fullName ||
        !this.currentMember.durationDays
      ) {
        this.error.set('Please fill in all required fields');
        return;
      }
    }

    this.loading.set(true);

    if (this.isEditMode() && this.currentMember._id) {
      const updateData: UpdateMemberRequest = {
        fullName: this.currentMember.fullName,
        durationDays: this.currentMember.durationDays,
        discountAmount: this.currentMember.discountAmount,
        status: this.currentMember.status,
      };
      this.membersService
        .updateMember(this.currentMember._id, updateData)
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.success.set('Member updated successfully');
            setTimeout(() => {
              this.closeModal();
              this.loadMembers();
            }, 1500);
          },
          error: (err: any) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Failed to update member');
          },
        });
    } else {
      const createData: CreateMemberRequest = {
        mobileNumber: this.currentMember.mobileNumber!,
        fullName: this.currentMember.fullName!,
        gender: this.currentMember.gender,
        dateOfBirth: this.currentMember.dateOfBirth,
        durationDays: this.currentMember.durationDays!,
        discountAmount: this.currentMember.discountAmount || 0,
        paymentMode: this.currentMember.paymentMode!,
        referenceNo: this.currentMember.referenceNo,
      };
      this.membersService.createMember(createData).subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Member created successfully');
          setTimeout(() => {
            this.closeModal();
            this.loadMembers();
          }, 1500);
        },
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Failed to create member');
        },
      });
    }
  }

  deleteMember() {
    if (!this.memberToDelete?._id) return;

    this.loading.set(true);
    this.error.set('');

    this.membersService.deleteMember(this.memberToDelete._id).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Member deleted successfully');
        setTimeout(() => {
          this.closeDeleteModal();
          this.loadMembers();
        }, 1500);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to delete member');
      },
    });
  }

  closeModal() {
    this.modalVisible.set(false);
    this.currentMember = {
      mobileNumber: '',
      fullName: '',
      gender: '',
      dateOfBirth: '',
      durationDays: 0,
      discountAmount: 0,
      paymentMode: 'Cash',
      referenceNo: '',
    };
    this.error.set('');
    this.success.set('');
  }

  closeDeleteModal() {
    this.deleteModalVisible.set(false);
    this.memberToDelete = null;
    this.error.set('');
    this.success.set('');
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadMembers();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadMembers();
    }
  }

  getMembershipStatus(member: Member): string {
    return member.status;
  }

  getMembershipStatusColor(member: Member): string {
    const status = member.status;
    if (status === 'Active') return 'success';
    if (status === 'Expired') return 'danger';
    if (status === 'Suspended') return 'warning';
    return 'secondary';
  }

  getActiveCount(): number {
    return this.members().filter((m) => m.status === 'Active').length;
  }

  getNoSubscriptionCount(): number {
    return this.members().filter((m) => m.status === 'No Subscription').length;
  }

  getPaymentStatusColor(status: string): string {
    if (status === 'Paid') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Failed') return 'danger';
    return 'secondary';
  }
}
