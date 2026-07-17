import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { Property } from '../../../core/models/models';

@Component({
  selector: 'app-property-card',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, CurrencyPipe],
  template: `
    <mat-card class="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <!-- Image -->
      <div class="relative h-48 bg-[#E6F2EC] overflow-hidden">
        @if (property().photoUrls.length) {
          <img [src]="property().photoUrls[0]" [alt]="property().name"
               class="w-full h-full object-cover" loading="lazy">
        } @else {
          <img src="/placeholder.jpg" [alt]="property().name"
               class="w-full h-full object-cover" loading="lazy">
        }
        <mat-chip class="absolute top-2 left-2 !bg-primary-600 !text-white">
          {{ property().propertyType }}
        </mat-chip>
      </div>

      <mat-card-content class="flex-1 p-4">
        <h3 class="font-semibold text-lg text-[#0A1A12] truncate mb-1">{{ property().name }}</h3>
        <p class="text-sm text-[#5C6B63] mb-3">
          <mat-icon class="text-sm align-middle">location_on</mat-icon>
          {{ property().location?.city }}, {{ property().location?.state }}
        </p>

        <div class="flex gap-3 text-sm text-[#5C6B63] mb-3">
          <span><mat-icon class="text-sm align-middle">bed</mat-icon> {{ property().beds }} bd</span>
          <span><mat-icon class="text-sm align-middle">bathtub</mat-icon> {{ property().baths }} ba</span>
          <span><mat-icon class="text-sm align-middle">square_foot</mat-icon> {{ property().squareFeet }} sqft</span>
        </div>

        <div class="flex flex-wrap gap-1 mb-2">
          @if (property().isPetsAllowed) {
            <mat-chip class="!text-xs">Pets OK</mat-chip>
          }
          @if (property().isParkingIncluded) {
            <mat-chip class="!text-xs">Parking</mat-chip>
          }
        </div>
      </mat-card-content>

      <mat-card-actions class="p-4 pt-0 flex items-center justify-between">
        <div>
          <span class="text-2xl font-bold text-primary-600">
            {{ property().pricePerMonth | currency:'USD':'symbol':'1.0-0' }}
          </span>
          <span class="text-sm text-[#5C6B63]">/mo</span>
        </div>
        <a mat-raised-button color="primary" [routerLink]="['/properties', property().id]">
          View
        </a>
      </mat-card-actions>
    </mat-card>
  `
})
export class PropertyCardComponent {
  readonly property = input.required<Property>();
}
