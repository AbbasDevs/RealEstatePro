import { Component, OnInit, signal, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { Application } from '../../../core/models/models';

@Component({
  selector: 'app-applications',
  imports: [RouterLink, MatTableModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule, CurrencyPipe, DatePipe],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-[#0A1A12] mb-6">My Applications</h1>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-progress-spinner mode="indeterminate" color="primary" /></div>
      } @else if (applications().length === 0) {
        <div class="text-center py-20 text-[#5C6B63]">
          <mat-icon class="text-6xl mb-3">description</mat-icon>
          <p class="text-xl">No applications yet</p>
          <a mat-raised-button color="primary" routerLink="/search" class="mt-4">Browse Properties</a>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl shadow-sm border border-[#c7d6cd]">
          <table mat-table [dataSource]="applications()" class="w-full">
            <!-- Property -->
            <ng-container matColumnDef="property">
              <th mat-header-cell *matHeaderCellDef class="!font-semibold">Property</th>
              <td mat-cell *matCellDef="let a">
                <a [routerLink]="['/properties', a.propertyId]" class="font-medium text-primary-600 hover:underline">
                  {{ a.property?.name ?? 'Property #' + a.propertyId }}
                </a>
                <p class="text-xs text-[#5C6B63]">{{ a.property?.location?.city }}, {{ a.property?.location?.state }}</p>
              </td>
            </ng-container>
            <!-- Rent -->
            <ng-container matColumnDef="rent">
              <th mat-header-cell *matHeaderCellDef class="!font-semibold">Monthly Rent</th>
              <td mat-cell *matCellDef="let a">{{ a.property?.pricePerMonth | currency }}</td>
            </ng-container>
            <!-- Date -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="!font-semibold">Applied On</th>
              <td mat-cell *matCellDef="let a">{{ a.applicationDate | date:'mediumDate' }}</td>
            </ng-container>
            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="!font-semibold">Status</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [class]="statusClass(a.status)">{{ a.status }}</mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols" class="bg-[#E6F2EC]"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;" class="hover:bg-[#F7FBF8]"></tr>
          </table>
        </div>
      }
    </div>
  `
})
export class ApplicationsComponent implements OnInit {
  loading = signal(true);
  applications = signal<Application[]>([]);
  cols = ['property', 'rent', 'date', 'status'];
  private appService = inject(ApplicationService);

  ngOnInit(): void {
    this.appService.getApplications().subscribe({
      next: a => { this.applications.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusClass(status: string): string {
    return {
      Pending:  '!bg-yellow-100 !text-yellow-800',
      Approved: '!bg-[#E6F2EC] !text-[#004D2C]',
      Denied:   '!bg-[#FDECEA] !text-[#D93025]'
    }[status] ?? '';
  }
}
