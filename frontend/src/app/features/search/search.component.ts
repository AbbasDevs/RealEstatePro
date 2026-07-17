import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertyQuery, PropertyType } from '../../core/models/models';

@Component({
  selector: 'app-search',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSliderModule, MatCheckboxModule,
    MatExpansionModule, MatProgressSpinnerModule, NavbarComponent, PropertyCardComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar />

      <div class="flex flex-1 overflow-hidden">
        <!-- Filters sidebar -->
        <aside class="w-72 bg-white border-r p-5 overflow-y-auto flex-shrink-0">
          <h2 class="text-lg font-semibold text-[#0A1A12] mb-4">Filters</h2>
          <form [formGroup]="form" (ngSubmit)="search()">
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Location</mat-label>
              <input matInput formControlName="location" placeholder="City, State">
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Property Type</mat-label>
              <mat-select formControlName="propertyType">
                <mat-option value="">Any</mat-option>
                @for (t of propertyTypes; track t) {
                  <mat-option [value]="t">{{ t }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="grid grid-cols-2 gap-2">
              <mat-form-field appearance="outline">
                <mat-label>Min Price</mat-label>
                <input matInput type="number" formControlName="minPrice" placeholder="0">
                <span matPrefix>$</span>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Max Price</mat-label>
                <input matInput type="number" formControlName="maxPrice" placeholder="∞">
                <span matPrefix>$</span>
              </mat-form-field>
            </div>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Min Bedrooms</mat-label>
              <mat-select formControlName="beds">
                <mat-option value="">Any</mat-option>
                @for (b of [1,2,3,4,5]; track b) {
                  <mat-option [value]="b">{{ b }}+</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="space-y-2 mb-4">
              <mat-checkbox formControlName="petsAllowed" color="primary">Pets Allowed</mat-checkbox>
              <mat-checkbox formControlName="parkingIncluded" color="primary">Parking Included</mat-checkbox>
            </div>

            <button mat-raised-button color="primary" type="submit" class="w-full">
              <mat-icon>search</mat-icon> Apply Filters
            </button>
            <button mat-button type="button" class="w-full mt-2" (click)="clearFilters()">
              Clear All
            </button>
          </form>
        </aside>

        <!-- Results -->
        <main class="flex-1 p-6 overflow-y-auto bg-[#FCFDFB]">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-[#0A1A12]">
              {{ loading() ? 'Searching...' : results().length + ' Properties Found' }}
            </h1>
          </div>

          @if (loading()) {
            <div class="flex justify-center items-center h-64">
              <mat-progress-spinner mode="indeterminate" color="primary" diameter="48" />
            </div>
          } @else if (results().length === 0) {
            <div class="text-center py-20 text-[#5C6B63]">
              <mat-icon class="text-6xl mb-4">search_off</mat-icon>
              <p class="text-xl">No properties match your filters</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              @for (p of results(); track p.id) {
                <app-property-card [property]="p" />
              }
            </div>
          }
        </main>
      </div>
    </div>
  `
})
export class SearchComponent implements OnInit {
  form = this.fb.group({
    location: [''],
    propertyType: [''],
    minPrice: [null as number | null],
    maxPrice: [null as number | null],
    beds: [null as number | null],
    petsAllowed: [false],
    parkingIncluded: [false]
  });

  loading = signal(false);
  results = signal<Property[]>([]);
  propertyTypes: PropertyType[] = ['Rooms', 'Tinyhouse', 'Apartment', 'Villa', 'Townhouse', 'Cottage'];

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['location']) this.form.patchValue({ location: params['location'] });
      if (params['propertyType']) this.form.patchValue({ propertyType: params['propertyType'] });
      if (params['minPrice']) this.form.patchValue({ minPrice: +params['minPrice'] });
      if (params['maxPrice']) this.form.patchValue({ maxPrice: +params['maxPrice'] });
      if (params['beds']) this.form.patchValue({ beds: +params['beds'] });
      if (params['petsAllowed']) this.form.patchValue({ petsAllowed: params['petsAllowed'] === 'true' });
      if (params['parkingIncluded']) this.form.patchValue({ parkingIncluded: params['parkingIncluded'] === 'true' });
      this.search();
    });
  }

  search(): void {
    this.loading.set(true);
    const v = this.form.value;
    const query: PropertyQuery = {};
    if (v.location)        query.location = v.location ?? undefined;
    if (v.propertyType)    query.propertyType = v.propertyType as PropertyType;
    if (v.minPrice != null) query.minPrice = v.minPrice!;
    if (v.maxPrice != null) query.maxPrice = v.maxPrice!;
    if (v.beds != null)    query.beds = v.beds!;
    if (v.petsAllowed)     query.petsAllowed = true;
    if (v.parkingIncluded) query.parkingIncluded = true;

    this.propertyService.getProperties(query).subscribe({
      next: props => { this.results.set(props); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  clearFilters(): void {
    this.form.reset();
    this.search();
  }
}
