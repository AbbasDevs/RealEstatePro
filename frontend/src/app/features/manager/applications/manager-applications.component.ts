import { Component, OnInit, signal, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { Application } from '../../../core/models/models';

@Component({
  selector: 'app-manager-applications',
  imports: [RouterLink, MatTableModule, MatButtonModule, MatChipsModule, MatIconModule,
            MatProgressSpinnerModule, MatMenuModule, MatSnackBarModule, DatePipe],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-[#0A1A12] mb-6">Applications</h1>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-progress-spinner mode="indeterminate" color="primary" /></div>
      } @else if (applications().length === 0) {
        <div class="text-center py-20 text-[#5C6B63]">
          <mat-icon class="text-6xl mb-3">assignment</mat-icon>
          <p class="text-xl">No applications received yet</p>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl shadow-sm border border-[#c7d6cd]">
          <table mat-table [dataSource]="applications()" class="w-full">
            <ng-container matColumnDef="applicant">
              <th mat-header-cell *matHeaderCellDef class="!font-semibold">Applicant</th>
              <td mat-cell *matCellDef="let a">
                <p class="font-medium">{{ a.name }}</p>
                <p class="text-xs text-[#5C6B63]">{{ a.email }}</p>
              </td>
            </ng-container>
            <ng-container matColumnDef="property">
              <th mat-header-cell *matHeaderCellDef class="!font-semibold">Property</th>
              <td mat-cell *matCellDef="let a">
                <a [routerLink]="['/properties', a.propertyId]" class="text-primary-600 hover:underline">
                  {{ a.property?.name ?? '#' + a.propertyId }}
                </a>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="!font-semibold">Applied</th>
              <td mat-cell *matCellDef="let a">{{ a.applicationDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="!font-semibold">Status</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [class]="statusClass(a.status)">{{ a.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a">
                @if (a.status === 'Pending') {
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" aria-label="Actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="updateStatus(a.id, 'Approved')">
                      <mat-icon class="text-[#007944]">check_circle</mat-icon> Approve
                    </button>
                    <button mat-menu-item (click)="updateStatus(a.id, 'Denied')">
                      <mat-icon class="text-[#D93025]">cancel</mat-icon> Deny
                    </button>
                  </mat-menu>
                }
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
export class ManagerApplicationsComponent implements OnInit {
  loading = signal(true);
  applications = signal<Application[]>([]);
  cols = ['applicant', 'property', 'date', 'status', 'actions'];
  private appService = inject(ApplicationService);
  private snack = inject(MatSnackBar);

  ngOnInit(): void {
    this.appService.getApplications().subscribe({
      next: a => { this.applications.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(id: number, status: string): void {
    this.appService.updateStatus(id, status).subscribe({
      next: updated => {
        this.applications.update(apps => apps.map(a => a.id === id ? updated : a));
        this.snack.open(`Application ${status.toLowerCase()}`, 'Close', { duration: 2000 });
      },
      error: () => this.snack.open('Failed to update status.', 'Close', { duration: 3000 })
    });
  }

  statusClass(status: string): string {
    return { Pending: '!bg-yellow-100 !text-yellow-800', Approved: '!bg-[#E6F2EC] !text-[#004D2C]', Denied: '!bg-[#FDECEA] !text-[#D93025]' }[status] ?? '';
  }
}
