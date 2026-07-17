import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyService } from '../../core/services/property.service';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/auth/auth.service';
import { Property } from '../../core/models/models';
import { ApplyDialogComponent } from './apply-dialog.component';

@Component({
  selector: 'app-property-detail',
  imports: [RouterLink, MatButtonModule, MatChipsModule, MatIconModule, MatDialogModule,
            MatProgressSpinnerModule, MatDividerModule, CurrencyPipe, DatePipe, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar />

      @if (loading()) {
        <div class="flex-1 flex justify-center items-center">
          <mat-progress-spinner mode="indeterminate" color="primary" />
        </div>
      } @else if (property()) {
        <div class="page-container">
          <!-- Photos gallery -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 rounded-2xl overflow-hidden h-80">
            @if (property()!.photoUrls.length) {
              <img [src]="property()!.photoUrls[0]" class="w-full h-full object-cover" [alt]="property()!.name">
              <div class="grid grid-cols-2 gap-3">
                @for (url of property()!.photoUrls.slice(1,5); track url) {
                  <img [src]="url" class="w-full h-full object-cover" [alt]="property()!.name">
                }
              </div>
            } @else {
              <img src="/placeholder.jpg" class="w-full h-full object-cover" [alt]="property()!.name">
              <div class="grid grid-cols-2 gap-3">
                <img src="/singlelisting-2.jpg" class="w-full h-full object-cover" alt="Property view">
                <img src="/singlelisting-3.jpg" class="w-full h-full object-cover" alt="Property view">
              </div>
            }
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main info -->
            <div class="lg:col-span-2">
              <div class="flex items-start justify-between mb-2">
                <h1 class="text-3xl font-bold text-[#0A1A12]">{{ property()!.name }}</h1>
                <mat-chip class="!bg-primary-600 !text-white">{{ property()!.propertyType }}</mat-chip>
              </div>
              <p class="text-[#5C6B63] flex items-center gap-1 mb-6">
                <mat-icon>location_on</mat-icon>
                {{ property()!.location?.address }}, {{ property()!.location?.city }}, {{ property()!.location?.state }}
              </p>

              <div class="flex gap-6 mb-6 text-[#0A1A12]">
                  <div class="text-center"><p class="text-2xl font-bold">{{ property()!.beds }}</p><p class="text-sm text-[#5C6B63]">Bedrooms</p></div>
                  <div class="text-center"><p class="text-2xl font-bold">{{ property()!.baths }}</p><p class="text-sm text-[#5C6B63]">Bathrooms</p></div>
                  <div class="text-center"><p class="text-2xl font-bold">{{ property()!.squareFeet }}</p><p class="text-sm text-[#5C6B63]">Sq Ft</p></div>
              </div>

              <mat-divider class="mb-6" />

              <h2 class="text-xl font-semibold text-[#0A1A12] mb-3">Description</h2>
              <p class="text-[#5C6B63] leading-relaxed mb-6">{{ property()!.description }}</p>

              <h2 class="text-xl font-semibold text-[#0A1A12] mb-3">Amenities</h2>
              <div class="flex flex-wrap gap-2 mb-6">
                @for (a of property()!.amenities; track a) {
                  <mat-chip>{{ a }}</mat-chip>
                }
              </div>

              <h2 class="text-xl font-semibold text-[#0A1A12] mb-3">Highlights</h2>
              <div class="flex flex-wrap gap-2">
                @for (h of property()!.highlights; track h) {
                  <mat-chip class="!bg-[#E6F2EC] !text-[#004D2C]">{{ h }}</mat-chip>
                }
              </div>
            </div>

            <!-- Pricing card -->
            <div>
              <div class="bg-white rounded-2xl shadow-md p-6 sticky top-24">
                <p class="text-4xl font-bold text-primary-600">
                  {{ property()!.pricePerMonth | currency:'USD':'symbol':'1.0-0' }}
                  <span class="text-base font-normal text-[#5C6B63]">/mo</span>
                </p>
                <mat-divider class="my-4" />
                <div class="space-y-2 text-sm text-[#5C6B63] mb-6">
                  <div class="flex justify-between">
                    <span>Security Deposit</span>
                    <span class="font-medium">{{ property()!.securityDeposit | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Application Fee</span>
                    <span class="font-medium">{{ property()!.applicationFee | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Pets</span>
                    <span class="font-medium">{{ property()!.isPetsAllowed ? 'Allowed' : 'Not Allowed' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Parking</span>
                    <span class="font-medium">{{ property()!.isParkingIncluded ? 'Included' : 'Not Included' }}</span>
                  </div>
                </div>

                @if (isLoggedIn() && role() === 'tenant') {
                  <button mat-raised-button color="primary" class="w-full text-base py-2" (click)="openApplyDialog()">
                    Apply Now
                  </button>
                } @else if (!isLoggedIn()) {
                  <a mat-raised-button color="primary" class="w-full text-base py-2" routerLink="/auth/login">
                    Sign In to Apply
                  </a>
                }

                <p class="text-xs text-[#5C6B63] mt-3 text-center">
                  Listed {{ property()!.postedDate | date:'mediumDate' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex-1 flex flex-col items-center justify-center text-[#5C6B63]">
          <mat-icon class="text-6xl">search_off</mat-icon>
          <p class="text-xl mt-2">Property not found.</p>
          <a mat-button color="primary" routerLink="/search">Browse Properties</a>
        </div>
      }
    </div>
  `
})
export class PropertyDetailComponent implements OnInit {
  loading = signal(true);
  property = signal<Property | null>(null);
  readonly isLoggedIn = inject(AuthService).isLoggedIn;
  readonly role = inject(AuthService).role;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.propertyService.getProperty(id).subscribe({
      next: p => { this.property.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openApplyDialog(): void {
    this.dialog.open(ApplyDialogComponent, {
      width: '500px',
      data: { propertyId: this.property()!.id, propertyName: this.property()!.name }
    });
  }
}
