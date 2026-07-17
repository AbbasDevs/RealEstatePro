import { Component, OnInit, signal, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-residences',
  imports: [RouterLink, MatCardModule, MatIconModule, MatProgressSpinnerModule, CurrencyPipe, DatePipe],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-[#0A1A12] mb-6">My Current Residences</h1>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-progress-spinner mode="indeterminate" color="primary" /></div>
      } @else if (residences().length === 0) {
        <div class="text-center py-20 text-[#5C6B63]">
          <mat-icon class="text-6xl mb-3">house</mat-icon>
          <p class="text-xl">No active residences</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (lease of residences(); track lease.id) {
            <mat-card class="hover:shadow-md transition-shadow">
              <mat-card-header>
                <mat-icon mat-card-avatar class="text-primary-600 !text-3xl mt-1">house</mat-icon>
                <mat-card-title>
                  <a [routerLink]="['/properties', lease.propertyId]" class="text-primary-600 hover:underline">
                    {{ lease.property?.name ?? 'Property #' + lease.propertyId }}
                  </a>
                </mat-card-title>
                <mat-card-subtitle>
                  {{ lease.property?.location?.address }}, {{ lease.property?.location?.city }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content class="mt-4">
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><p class="text-[#5C6B63]">Monthly Rent</p><p class="font-semibold">{{ lease.rent | currency }}</p></div>
                  <div><p class="text-[#5C6B63]">Deposit</p><p class="font-semibold">{{ lease.deposit | currency }}</p></div>
                  <div><p class="text-[#5C6B63]">Start Date</p><p class="font-semibold">{{ lease.startDate | date:'mediumDate' }}</p></div>
                  <div><p class="text-[#5C6B63]">End Date</p><p class="font-semibold">{{ lease.endDate | date:'mediumDate' }}</p></div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `
})
export class ResidencesComponent implements OnInit {
  loading = signal(true);
  residences = signal<any[]>([]);
  private tenantService = inject(TenantService);
  private tenantId = inject(AuthService).tenantId;

  ngOnInit(): void {
    const id = this.tenantId();
    if (!id) return;
    this.tenantService.getCurrentResidences(id).subscribe({
      next: r => { this.residences.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
