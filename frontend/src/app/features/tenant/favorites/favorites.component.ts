import { Component, OnInit, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Property } from '../../../core/models/models';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule, PropertyCardComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-[#0A1A12] mb-6">My Favorites</h1>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-progress-spinner mode="indeterminate" color="primary" /></div>
      } @else if (favorites().length === 0) {
        <div class="text-center py-20 text-[#5C6B63]">
          <mat-icon class="text-6xl mb-3">favorite_border</mat-icon>
          <p class="text-xl">No favorites yet</p>
          <a mat-raised-button color="primary" routerLink="/search" class="mt-4">Browse Properties</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          @for (p of favorites(); track p.id) {
            <div class="relative">
              <button mat-mini-fab color="warn"
                      class="absolute top-2 right-2 z-10"
                      (click)="removeFavorite(p.id)"
                      aria-label="Remove from favorites">
                <mat-icon>favorite</mat-icon>
              </button>
              <app-property-card [property]="p" />
            </div>
          }
        </div>
      }
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  loading = signal(true);
  favorites = signal<Property[]>([]);
  private tenantId = inject(AuthService).tenantId;
  private tenantService = inject(TenantService);
  private snack = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.tenantId();
    if (!id) return;
    this.tenantService.getTenant(id).subscribe({
      next: t => { this.favorites.set(t.favorites ?? []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  removeFavorite(propertyId: number): void {
    const id = this.tenantId();
    if (!id) return;
    this.tenantService.removeFavorite(id, propertyId).subscribe({
      next: t => {
        this.favorites.set(t.favorites ?? []);
        this.snack.open('Removed from favorites', 'Close', { duration: 2000 });
      }
    });
  }
}
