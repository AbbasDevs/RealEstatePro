import { Component, OnInit, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ManagerService } from '../../../core/services/manager.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Property } from '../../../core/models/models';
import { CreatePropertyDialogComponent } from './create-property-dialog.component';

@Component({
  selector: 'app-manager-properties',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatDialogModule, MatProgressSpinnerModule, MatCardModule, CurrencyPipe],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-[#0A1A12]">My Properties</h1>
        <button mat-raised-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon> Add Property
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-progress-spinner mode="indeterminate" color="primary" /></div>
      } @else if (properties().length === 0) {
        <div class="text-center py-20 text-[#5C6B63]">
          <mat-icon class="text-6xl mb-3">business</mat-icon>
          <p class="text-xl mb-4">No properties listed yet</p>
          <button mat-raised-button color="primary" (click)="openCreate()">Add Your First Property</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (p of properties(); track p.id) {
            <mat-card class="hover:shadow-md transition-shadow overflow-hidden">
              <div class="h-40 bg-[#E6F2EC] overflow-hidden">
                @if (p.photoUrls.length) {
                  <img [src]="p.photoUrls[0]" class="w-full h-full object-cover" [alt]="p.name">
                } @else {
                  <div class="w-full h-full flex items-center justify-center bg-[#E6F2EC]">
                    <mat-icon class="text-4xl text-[#5C6B63]">home</mat-icon>
                  </div>
                }
              </div>
              <mat-card-content class="p-4">
                <h3 class="font-semibold text-[#0A1A12] truncate">{{ p.name }}</h3>
                <p class="text-sm text-[#5C6B63]">{{ p.location?.city }}, {{ p.location?.state }}</p>
                <p class="text-lg font-bold text-primary-600 mt-2">{{ p.pricePerMonth | currency:'USD':'symbol':'1.0-0' }}<span class="text-sm text-[#5C6B63]">/mo</span></p>
              </mat-card-content>
              <mat-card-actions class="p-4 pt-0">
                <a mat-button color="primary" [routerLink]="['/properties', p.id]">View</a>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `
})
export class ManagerPropertiesComponent implements OnInit {
  loading = signal(true);
  properties = signal<Property[]>([]);
  private managerId = inject(AuthService).managerId;
  private managerService = inject(ManagerService);
  private dialog = inject(MatDialog);

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.managerId();
    if (!id) return;
    this.managerService.getManagerProperties(id).subscribe({
      next: p => { this.properties.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    const ref = this.dialog.open(CreatePropertyDialogComponent, {
      width: '920px',
      minWidth: '320px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false
    });
    ref.afterClosed().subscribe(created => { if (created) this.load(); });
  }
}
