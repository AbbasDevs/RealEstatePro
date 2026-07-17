import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/models';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, FormsModule, NavbarComponent, PropertyCardComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar />

      <!-- Hero with splash background -->
      <section class="relative text-white py-32 px-6"
               style="background: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/landing-splash.jpg') center/cover no-repeat;">
        <div class="max-w-4xl mx-auto text-center relative z-10">
          <h1 class="text-5xl font-bold mb-4 leading-tight">Find Your Perfect Home</h1>
          <p class="text-xl text-gray-200 mb-10">Thousands of verified listings. Transparent pricing. No hidden fees.</p>

          <!-- Quick search -->
          <div class="bg-white rounded-2xl shadow-xl p-6 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <mat-form-field class="flex-1" appearance="outline">
              <mat-label class="text-[#5C6B63]">City, State or Zip</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="goSearch()" placeholder="e.g. New York, NY">
              <mat-icon matPrefix class="text-[#5C6B63]">search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" class="h-14 px-8 text-base" (click)="goSearch()">
              Search
            </button>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-16 px-6 bg-white">
        <div class="max-w-5xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-[#0A1A12] mb-2">How It Works</h2>
          <p class="text-[#5C6B63] mb-12">Your journey to a new home in three simple steps</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div class="flex flex-col items-center">
              <img src="/landing-icon-wand.png" alt="Search" class="h-16 w-16 mb-4">
              <h3 class="text-lg font-semibold text-[#0A1A12] mb-2">Search Properties</h3>
              <p class="text-[#5C6B63] text-sm">Browse thousands of verified listings filtered by location, price, and amenities.</p>
            </div>
            <div class="flex flex-col items-center">
              <img src="/landing-icon-heart.png" alt="Save" class="h-16 w-16 mb-4">
              <h3 class="text-lg font-semibold text-[#0A1A12] mb-2">Save Favorites</h3>
              <p class="text-[#5C6B63] text-sm">Shortlist the ones you love and compare them side by side.</p>
            </div>
            <div class="flex flex-col items-center">
              <img src="/landing-icon-calendar.png" alt="Apply" class="h-16 w-16 mb-4">
              <h3 class="text-lg font-semibold text-[#0A1A12] mb-2">Apply & Move In</h3>
              <p class="text-[#5C6B63] text-sm">Submit your application online and get approved fast.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Search Steps -->
      <section class="py-16 px-6 bg-[#FCFDFB]">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-[#0A1A12] mb-2 text-center">Discover Your Way</h2>
          <p class="text-[#5C6B63] mb-12 text-center">Explore properties through different lenses</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="rounded-2xl overflow-hidden shadow-md group">
              <img src="/landing-search1.png" alt="Map search" class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300">
              <div class="p-4 bg-white">
                <h3 class="font-semibold text-[#0A1A12]">Map Search</h3>
                <p class="text-sm text-[#5C6B63]">Find homes based on your preferred neighborhood.</p>
              </div>
            </div>
            <div class="rounded-2xl overflow-hidden shadow-md group">
              <img src="/landing-search2.png" alt="Filter search" class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300">
              <div class="p-4 bg-white">
                <h3 class="font-semibold text-[#0A1A12]">Smart Filters</h3>
                <p class="text-sm text-[#5C6B63]">Narrow down by price, size, and amenities instantly.</p>
              </div>
            </div>
            <div class="rounded-2xl overflow-hidden shadow-md group">
              <img src="/landing-search3.png" alt="Gallery search" class="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300">
              <div class="p-4 bg-white">
                <h3 class="font-semibold text-[#0A1A12]">Photo Gallery</h3>
                <p class="text-sm text-[#5C6B63]">Browse high-quality photos before you visit.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Property Categories -->
      <section class="py-16 px-6 bg-white">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-bold text-[#0A1A12] mb-2">Explore by Type</h2>
          <p class="text-[#5C6B63] mb-8">Find the perfect space for your lifestyle</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            @for (cat of categories; track cat.label) {
              <a [routerLink]="['/search']" [queryParams]="{propertyType: cat.type}"
                 class="relative rounded-xl overflow-hidden h-40 group no-underline">
                <img [src]="cat.image" [alt]="cat.label"
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <span class="text-white font-semibold text-lg">{{ cat.label }}</span>
                </div>
              </a>
            }
          </div>
        </div>
      </section>

      <!-- Discover section with background -->
      <section class="relative py-24 px-6 text-white"
               style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/landing-discover-bg.jpg') center/cover no-repeat;">
        <div class="max-w-5xl mx-auto text-center">
          <h2 class="text-4xl font-bold mb-4">Discover Homes That Fit Your Budget</h2>
          <p class="text-lg text-gray-200 mb-4">Over 10,000 properties. From cozy studios to luxury villas.</p>
          <div class="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-8">
            <div>
              <p class="text-4xl font-bold">10k+</p>
              <p class="text-gray-300 mt-1 text-sm">Listings</p>
            </div>
            <div>
              <p class="text-4xl font-bold">50k+</p>
              <p class="text-gray-300 mt-1 text-sm">Happy Tenants</p>
            </div>
            <div>
              <p class="text-4xl font-bold">5k+</p>
              <p class="text-gray-300 mt-1 text-sm">Managers</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured listings -->
      <section class="py-16 px-6 bg-[#FCFDFB]">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-bold text-[#0A1A12] mb-2">Featured Properties</h2>
          <p class="text-[#5C6B63] mb-8">Hand-picked properties just for you</p>

          @if (loading()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="h-80 bg-[#E6F2EC] rounded-xl animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (p of featured(); track p.id) {
                <app-property-card [property]="p" />
              }
            </div>
            <div class="text-center mt-10">
              <a mat-stroked-button color="primary" routerLink="/search" class="text-base px-8 py-2">
                View All Properties
              </a>
            </div>
          }
        </div>
      </section>

      <!-- CTA -->
      <section class="relative py-20 px-6 text-white"
               style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/landing-call-to-action.jpg') center/cover no-repeat;">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p class="text-gray-200 mb-8">Join thousands of happy tenants who found their perfect place.</p>
          <a mat-raised-button color="primary" routerLink="/auth/register" class="text-lg px-10 py-3">
            Get Started Free
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-gray-400 py-8 px-6 mt-auto">
        <div class="max-w-7xl mx-auto text-center">
          <img src="/logo.svg" alt="RealEstate" class="h-8 w-8 mx-auto mb-2 rounded bg-primary-600 p-1">
          <p class="font-semibold text-white mb-1">RealEstate</p>
          <p class="text-sm">&copy; {{ year }} All rights reserved.</p>
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent implements OnInit {
  searchQuery = '';
  loading = signal(true);
  featured = signal<Property[]>([]);
  year = new Date().getFullYear();

  categories = [
    { image: '/landing-i1.png', label: 'Apartments', type: 'Apartment' },
    { image: '/landing-i2.png', label: 'Villas', type: 'Villa' },
    { image: '/landing-i3.png', label: 'Townhouses', type: 'Townhouse' },
    { image: '/landing-i4.png', label: 'Cottages', type: 'Cottage' },
    { image: '/landing-i5.png', label: 'Rooms', type: 'Rooms' },
    { image: '/landing-i6.png', label: 'Tiny Houses', type: 'Tinyhouse' },
    { image: '/landing-i7.png', label: 'All Types', type: '' },
  ];

  constructor(private propertyService: PropertyService, private router: Router) {}

  ngOnInit(): void {
    this.propertyService.getProperties().subscribe({
      next: props => {
        this.featured.set(props.slice(0, 6));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goSearch(): void {
    this.router.navigate(['/search'], {
      queryParams: this.searchQuery ? { location: this.searchQuery } : {}
    });
  }
}
