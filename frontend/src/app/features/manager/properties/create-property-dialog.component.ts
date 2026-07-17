import { afterNextRender, Component, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PropertyService } from '../../../core/services/property.service';
import type * as L from 'leaflet';

@Component({
  selector: 'app-create-property-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
            MatCheckboxModule, MatButtonModule, MatSnackBarModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="text-xl font-semibold">Add New Property</h2>
    <mat-dialog-content class="create-property-dialog-content max-h-[72vh] overflow-y-auto overflow-x-hidden pr-1">
      <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <mat-form-field class="col-span-2" appearance="outline">
          <mat-label>Property Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field class="col-span-2" appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Price / Month ($)</mat-label>
          <input matInput type="number" formControlName="pricePerMonth">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Security Deposit ($)</mat-label>
          <input matInput type="number" formControlName="securityDeposit">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Application Fee ($)</mat-label>
          <input matInput type="number" formControlName="applicationFee">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Property Type</mat-label>
          <select matNativeControl formControlName="propertyType">
            @for (t of types; track t) { <option [value]="t">{{ t }}</option> }
          </select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Bedrooms</mat-label>
          <input matInput type="number" formControlName="beds">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Bathrooms</mat-label>
          <input matInput type="number" formControlName="baths">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Square Feet</mat-label>
          <input matInput type="number" formControlName="squareFeet">
        </mat-form-field>
        <div class="flex flex-col gap-2 justify-center">
          <mat-checkbox formControlName="isPetsAllowed" color="primary">Pets Allowed</mat-checkbox>
          <mat-checkbox formControlName="isParkingIncluded" color="primary">Parking Included</mat-checkbox>
        </div>
        <!-- Location -->
        <mat-form-field class="col-span-2" appearance="outline">
          <mat-label>Street Address</mat-label>
          <input matInput formControlName="address">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>City</mat-label>
          <input matInput formControlName="city">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>State</mat-label>
          <input matInput formControlName="state">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Country</mat-label>
          <input matInput formControlName="country">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Postal Code</mat-label>
          <input matInput formControlName="postalCode">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Latitude (optional)</mat-label>
          <input matInput type="number" formControlName="latitude">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Longitude (optional)</mat-label>
          <input matInput type="number" formControlName="longitude">
        </mat-form-field>

        <div class="col-span-1 md:col-span-2 rounded-lg border border-[#c7d6cd] p-3 bg-[#FCFDFB]">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <button mat-stroked-button type="button" (click)="lookupCoordinates()" [disabled]="locating">
              <mat-icon>place</mat-icon>
              {{ locating ? 'Locating...' : 'Find On Map' }}
            </button>
            <button mat-stroked-button color="primary" type="button" (click)="locateMyApartment()" [disabled]="locatingCurrent">
              <mat-icon>my_location</mat-icon>
              {{ locatingCurrent ? 'Getting location...' : 'Use My Current Location' }}
            </button>
            <button mat-button type="button" (click)="openMapInNewTab()">
              <mat-icon>open_in_new</mat-icon>
              Open Map
            </button>
            <button mat-button type="button" color="warn" (click)="clearPin()">
              <mat-icon>clear</mat-icon>
              Clear Pin
            </button>
          </div>
          <div #mapHost class="w-full h-72 rounded border border-[#c7d6cd]"></div>
          <p class="text-sm text-[#5C6B63] mt-2">Click on the map to drop a pin, then drag it to adjust the exact property location.</p>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="bg-white border-t border-[#c7d6cd]">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="submitting || form.invalid">
        {{ submitting ? 'Creating...' : 'Create Property' }}
      </button>
    </mat-dialog-actions>
  `
})
export class CreatePropertyDialogComponent implements OnDestroy {
  readonly mapHost = viewChild.required<ElementRef<HTMLDivElement>>('mapHost');

  types = ['Rooms', 'Tinyhouse', 'Apartment', 'Villa', 'Townhouse', 'Cottage'];
  submitting = false;
  locating = false;
  locatingCurrent = false;
  private leaflet: typeof L | null = null;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    pricePerMonth: [null as number | null, [Validators.required, Validators.min(0)]],
    securityDeposit: [null as number | null, Validators.required],
    applicationFee: [null as number | null, Validators.required],
    propertyType: ['Apartment', Validators.required],
    beds: [1, Validators.required],
    baths: [1, Validators.required],
    squareFeet: [null as number | null, Validators.required],
    isPetsAllowed: [false],
    isParkingIncluded: [false],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    country: ['', Validators.required],
    postalCode: ['', Validators.required],
    latitude: [null as number | null],
    longitude: [null as number | null]
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreatePropertyDialogComponent>,
    private propertyService: PropertyService,
    private snack: MatSnackBar
  ) {
    afterNextRender(() => this.initMap());
  }

  ngOnDestroy(): void {
    this.marker?.remove();
    this.map?.remove();
    this.marker = null;
    this.map = null;
    this.leaflet = null;
  }

  private async initMap(): Promise<void> {
    this.leaflet = await import('leaflet');
    const L = this.leaflet as typeof import('leaflet');

    // Fix default icon paths broken by bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const lat = this.form.value.latitude ?? 30.2672;
    const lon = this.form.value.longitude ?? -97.7431;
    const zoom = this.form.value.latitude != null ? 14 : 11;

    this.map = L.map(this.mapHost().nativeElement, { zoomControl: true }).setView([lat, lon], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Fix for Leaflet inside Angular Material Dialogs
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 300);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.setCoordinates(event.latlng.lat, event.latlng.lng, true);
    });

    if (this.form.value.latitude != null && this.form.value.longitude != null) {
      this.placeMarker(this.form.value.latitude, this.form.value.longitude);
    }
  }

  private buildAddressQuery(): string {
    const v = this.form.getRawValue();
    return [v.address, v.city, v.state, v.country, v.postalCode].filter(Boolean).join(', ');
  }

  private placeMarker(lat: number, lon: number): void {
    if (!this.map || !this.leaflet) return;
    const L = this.leaflet as typeof import('leaflet');

    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      this.marker = L.marker([lat, lon], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker?.getLatLng();
        if (!pos) return;
        this.setCoordinates(pos.lat, pos.lng, true);
      });
    }
    this.map.flyTo([lat, lon], 15);
  }

  private setCoordinates(lat: number, lon: number, reverseGeocode: boolean): void {
    const roundedLat = Number(lat.toFixed(7));
    const roundedLon = Number(lon.toFixed(7));
    this.form.patchValue({ latitude: roundedLat, longitude: roundedLon }, { emitEvent: false });
    this.placeMarker(roundedLat, roundedLon);

    if (reverseGeocode) {
      this.reverseGeocodeAndPatchAddress(roundedLat, roundedLon);
    }
  }

  private async reverseGeocodeAndPatchAddress(lat: number, lon: number): Promise<void> {
    try {
      const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      const data = (await response.json()) as {
        address?: {
          house_number?: string;
          road?: string;
          city?: string;
          town?: string;
          village?: string;
          state?: string;
          country?: string;
          postcode?: string;
        };
      };

      const address = data.address;
      if (!address) return;

      const street = [address.house_number, address.road].filter(Boolean).join(' ').trim();
      this.form.patchValue({
        address: street || this.form.value.address || '',
        city: address.city || address.town || address.village || this.form.value.city || '',
        state: address.state || this.form.value.state || '',
        country: address.country || this.form.value.country || '',
        postalCode: address.postcode || this.form.value.postalCode || ''
      });
    } catch {
      // Ignore reverse-geocode errors to keep pin placement responsive.
    }
  }

  async lookupCoordinates(): Promise<void> {
    const existingLat = this.form.value.latitude;
    const existingLon = this.form.value.longitude;
    if (existingLat != null && existingLon != null) {
      this.setCoordinates(existingLat, existingLon, false);
      await this.reverseGeocodeAndPatchAddress(existingLat, existingLon);
      this.snack.open('Using entered coordinates.', 'Close', { duration: 2200 });
      return;
    }

    const value = this.form.getRawValue();
    const queries = [
      this.buildAddressQuery(),
      [value.address, value.city, value.country].filter(Boolean).join(', '),
      [value.city, value.state, value.country].filter(Boolean).join(', '),
      [value.city, value.country].filter(Boolean).join(', ')
    ].filter((q, index, arr) => q && arr.indexOf(q) === index);

    if (!queries.length) {
      this.snack.open('Enter address details first.', 'Close', { duration: 2500 });
      return;
    }

    const countryCode = (value.country || '').toLowerCase().includes('egypt') ? 'eg' : '';

    this.locating = true;
    try {
      let hit: { lat: string; lon: string } | null = null;

      for (const query of queries) {
        const params = new URLSearchParams({
          format: 'jsonv2',
          limit: '1',
          addressdetails: '1',
          'accept-language': 'en,ar',
          q: query
        });
        if (countryCode) params.set('countrycodes', countryCode);

        const endpoint = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
        if (!response.ok) continue;

        const data = (await response.json()) as Array<{ lat: string; lon: string }>;
        if (data.length) {
          hit = data[0];
          break;
        }
      }

      if (!hit) {
        this.snack.open('Location not found. Try clicking directly on the map.', 'Close', { duration: 3200 });
        return;
      }

      const lat = Number(hit.lat);
      const lon = Number(hit.lon);
      this.setCoordinates(lat, lon, false);
      this.snack.open('Coordinates detected from address.', 'Close', { duration: 2200 });
    } catch {
      this.snack.open('Unable to fetch map location right now.', 'Close', { duration: 3000 });
    } finally {
      this.locating = false;
    }
  }

  async locateMyApartment(): Promise<void> {
    if (!('geolocation' in navigator)) {
      this.snack.open('Geolocation is not supported on this browser.', 'Close', { duration: 3000 });
      return;
    }

    this.locatingCurrent = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(7));
        const lon = Number(position.coords.longitude.toFixed(7));
        this.setCoordinates(lat, lon, false);
        await this.reverseGeocodeAndPatchAddress(lat, lon);
        this.locatingCurrent = false;
        this.snack.open('Location detected and property site data filled.', 'Close', { duration: 2600 });
      },
      () => {
        this.locatingCurrent = false;
        this.snack.open('Could not access your location.', 'Close', { duration: 3000 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  openMapInNewTab(): void {
    const lat = this.form.value.latitude;
    const lon = this.form.value.longitude;
    if (lat != null && lon != null) {
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`, '_blank');
      return;
    }

    const address = this.buildAddressQuery();
    if (address) {
      window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`, '_blank');
      return;
    }
    this.snack.open('Enter address details first.', 'Close', { duration: 2500 });
  }

  clearPin(): void {
    this.form.patchValue({ latitude: null, longitude: null });
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
    this.snack.open('Map pin cleared.', 'Close', { duration: 1800 });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    const payload = this.form.getRawValue();
    this.propertyService.createProperty(payload as any).subscribe({
      next: () => {
        this.snack.open('Property created!', 'Close', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        const detail = typeof err?.error === 'string' ? err.error : err?.error?.message;
        this.snack.open(detail ?? 'Failed to create property.', 'Close', { duration: 3500 });
        this.submitting = false;
      }
    });
  }
}
