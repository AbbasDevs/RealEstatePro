import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { OwnerRequest } from '../../../core/models/models';

@Component({
  selector: 'app-admin-owner-requests',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold" style="color:#0A1A12">Owner Requests</h1>
        <p class="mt-1" style="color:#5C6B63">Approve tenants who should be allowed to list rental properties.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-progress-spinner mode="indeterminate" color="primary" /></div>
      } @else if (requests().length === 0) {
        <div class="rounded-2xl border border-[#c7d6cd] bg-white p-10 text-center text-[#5C6B63]">
          <mat-icon class="text-5xl">verified_user</mat-icon>
          <p class="mt-3 text-lg">No owner requests yet.</p>
        </div>
      } @else {
        <div class="grid gap-4">
          @for (request of requests(); track request.userId) {
            <mat-card class="rounded-2xl border border-[#c7d6cd] shadow-none">
              <mat-card-content class="p-5 flex items-start justify-between gap-4">
                <div>
                  <h2 class="text-lg font-semibold" style="color:#0A1A12">{{ request.name }}</h2>
                  <p class="text-sm" style="color:#5C6B63">{{ request.email }}</p>
                  <p class="text-sm mt-1" style="color:#5C6B63">Phone: {{ request.phoneNumber }}</p>
                  <p class="text-sm mt-2">
                    <span class="rounded-full px-2.5 py-1 text-xs font-medium"
                      [style.background]="request.status === 'pending' ? '#FFF7E6' : request.status === 'approved' ? '#E6F2EC' : request.status === 'rejected' ? '#FDECEA' : '#F1F3F2'"
                      [style.color]="request.status === 'pending' ? '#92400E' : request.status === 'approved' ? '#004D2C' : request.status === 'rejected' ? '#D93025' : '#5C6B63'">
                      {{ request.status }}
                    </span>
                  </p>
                </div>

                <div class="flex gap-2">
                  <button mat-stroked-button
                    class="!border-[#D93025] !text-[#D93025] !bg-[#FDECEA] hover:!bg-[#D93025] hover:!text-white transition-colors duration-200 hover:shadow-md"
                    (click)="reject(request)"
                    [disabled]="busyUserId() === request.userId || request.status === 'rejected'">
                    Reject
                  </button>
                  <button mat-raised-button
                    class="!bg-[#007944] hover:!bg-[#004D2C] !text-white transition-colors duration-200 hover:shadow-md"
                    (click)="approve(request)"
                    [disabled]="busyUserId() === request.userId || request.status === 'approved'">
                    Approve
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `
})
export class AdminOwnerRequestsComponent implements OnInit {
  private adminService = inject(AdminService);
  private snack = inject(MatSnackBar);

  loading = signal(true);
  busyUserId = signal<number | null>(null);
  requests = signal<OwnerRequest[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminService.getOwnerRequests().subscribe({
      next: requests => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => {
        this.snack.open('Failed to load owner requests.', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  approve(request: OwnerRequest): void {
    this.busyUserId.set(request.userId);
    this.adminService.approveOwnerRequest(request.userId).subscribe({
      next: () => {
        this.snack.open('Owner request approved.', 'Close', { duration: 2500 });
        this.busyUserId.set(null);
        this.load();
      },
      error: err => {
        this.snack.open(err?.error?.message ?? 'Approval failed.', 'Close', { duration: 3000 });
        this.busyUserId.set(null);
      }
    });
  }

  reject(request: OwnerRequest): void {
    this.busyUserId.set(request.userId);
    this.adminService.rejectOwnerRequest(request.userId).subscribe({
      next: () => {
        this.snack.open('Owner request rejected.', 'Close', { duration: 2500 });
        this.busyUserId.set(null);
        this.load();
      },
      error: err => {
        this.snack.open(err?.error?.message ?? 'Rejection failed.', 'Close', { duration: 3000 });
        this.busyUserId.set(null);
      }
    });
  }
}