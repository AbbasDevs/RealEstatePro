import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatDividerModule],
  host: { '(document:click)': 'onDocumentClick()' },
  template: `
    <mat-toolbar class="!bg-white shadow-sm border-b border-[#c7d6cd] !px-6 sticky top-0 z-50">
      <!-- Brand -->
      <a routerLink="/" class="flex items-center gap-2 no-underline">
        <img src="/logo.svg" alt="RealEstate" class="h-8 w-8 rounded bg-primary-600 p-1">
        <span class="font-bold text-xl text-[#0A1A12]">RealEstate</span>
      </a>

      <span class="flex-1"></span>

      <!-- Search link -->
      <a mat-button routerLink="/search" routerLinkActive="text-primary-600" class="mr-2">
        <mat-icon>search</mat-icon> Browse
      </a>

      @if (isLoggedIn()) {
        <!-- Authenticated menu -->
        <div class="relative" (click)="$event.stopPropagation()">
          <button mat-button class="flex items-center gap-1" (click)="toggleUserMenu($event)">
            <mat-icon>account_circle</mat-icon>
            <span class="hidden sm:inline">{{ email() }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>

          @if (menuOpen) {
              <div class="absolute right-0 top-full mt-2 w-80 bg-white border border-[#c7d6cd] rounded-md shadow-xl py-1 z-[1000]">
              @if (role() === 'tenant') {
                  <a routerLink="/tenant/favorites" class="h-12 px-4 flex items-center gap-3 text-[#0A1A12] hover:bg-[#E6F2EC] no-underline" (click)="closeUserMenu()">
                  <mat-icon>favorite</mat-icon> Favorites
                </a>
                <a routerLink="/tenant/applications" class="h-12 px-4 flex items-center gap-3 text-[#0A1A12] hover:bg-[#E6F2EC] no-underline" (click)="closeUserMenu()">
                  <mat-icon>description</mat-icon> Applications
                </a>
                <a routerLink="/tenant/residences" class="h-12 px-4 flex items-center gap-3 text-[#0A1A12] hover:bg-[#E6F2EC] no-underline" (click)="closeUserMenu()">
                  <mat-icon>house</mat-icon> My Residences
                </a>
                <a routerLink="/tenant/settings" class="h-12 px-4 flex items-center gap-3 text-[#0A1A12] hover:bg-[#E6F2EC] no-underline" (click)="closeUserMenu()">
                  <mat-icon>settings</mat-icon> Settings
                </a>
              } @else if (role() === 'admin') {
                <a routerLink="/admin/owner-requests" class="h-12 px-4 flex items-center gap-3 text-[#0A1A12] hover:bg-[#E6F2EC] no-underline" (click)="closeUserMenu()">
                  <mat-icon>verified_user</mat-icon> Owner Requests
                </a>
              } @else {
                <a routerLink="/manager/properties" class="h-12 px-4 flex items-center gap-3 text-[#0A1A12] hover:bg-[#E6F2EC] no-underline" (click)="closeUserMenu()">
                  <mat-icon>business</mat-icon> My Properties
                </a>
                <a routerLink="/manager/applications" class="h-12 px-4 flex items-center gap-3 text-[#0A1A12] hover:bg-[#E6F2EC] no-underline" (click)="closeUserMenu()">
                  <mat-icon>assignment</mat-icon> Applications
                </a>
                <a routerLink="/manager/settings" class="h-12 px-4 flex items-center gap-3 text-[#0A1A12] hover:bg-[#E6F2EC] no-underline" (click)="closeUserMenu()">
                  <mat-icon>settings</mat-icon> Settings
                </a>
              }
              <mat-divider />
              <button class="w-full h-12 px-4 text-left flex items-center gap-3 text-[#D93025] hover:bg-[#E6F2EC]" (click)="logout()">
                <mat-icon class="text-[#D93025]">logout</mat-icon> Sign Out
              </button>
            </div>
          }
        </div>
      } @else {
        <a mat-button routerLink="/auth/login">Sign In</a>
        <a mat-raised-button color="primary" routerLink="/auth/register" class="ml-2">Sign Up</a>
      }
    </mat-toolbar>
  `
})
export class NavbarComponent {
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly role       = this.auth.role;
  readonly email      = computed(() => this.auth.authUser()?.email ?? '');
  menuOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  closeUserMenu(): void {
    this.menuOpen = false;
  }

  onDocumentClick(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.menuOpen = false;
    this.auth.logout();
  }
}
