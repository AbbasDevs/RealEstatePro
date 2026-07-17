import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatIconModule, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar />
      <mat-sidenav-container class="flex-1">
        <mat-sidenav mode="side" opened class="w-56 pt-4">
          <mat-nav-list>
            @if (role() === 'tenant') {
              <a mat-list-item routerLink="/tenant/favorites" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>favorite</mat-icon>
                <span matListItemTitle>Favorites</span>
              </a>
              <a mat-list-item routerLink="/tenant/applications" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>description</mat-icon>
                <span matListItemTitle>Applications</span>
              </a>
              <a mat-list-item routerLink="/tenant/residences" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>house</mat-icon>
                <span matListItemTitle>My Residences</span>
              </a>
              <a mat-list-item routerLink="/tenant/settings" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>settings</mat-icon>
                <span matListItemTitle>Settings</span>
              </a>
            } @else if (role() === 'admin') {
              <a mat-list-item routerLink="/admin/owner-requests" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>verified_user</mat-icon>
                <span matListItemTitle>Owner Requests</span>
              </a>
            } @else {
              <a mat-list-item routerLink="/manager/properties" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>business</mat-icon>
                <span matListItemTitle>My Properties</span>
              </a>
              <a mat-list-item routerLink="/manager/applications" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>assignment</mat-icon>
                <span matListItemTitle>Applications</span>
              </a>
              <a mat-list-item routerLink="/manager/analytics" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>bar_chart</mat-icon>
                <span matListItemTitle>Analytics</span>
              </a>
              <a mat-list-item routerLink="/manager/settings" routerLinkActive="bg-primary-50 text-primary-700" class="rounded-lg mx-2">
                <mat-icon matListItemIcon>settings</mat-icon>
                <span matListItemTitle>Settings</span>
              </a>
            }
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="p-6 bg-[#FCFDFB]">
          @if (role() === 'tenant' && ownerRequestStatus() === 'pending') {
            <div class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
              Your owner request is pending admin review. You can browse and apply as a tenant until approval.
            </div>
          }
          @if (role() === 'tenant' && ownerRequestStatus() === 'rejected') {
            <div class="mb-4 rounded-xl border border-[#F5C6C4] bg-[#FDECEA] px-4 py-3 text-[#D93025]">
              Your owner request was rejected. You can continue as a tenant or ask an admin to review your account again.
            </div>
          }
          <router-outlet />
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `
})
export class DashboardLayoutComponent {
  readonly role = inject(AuthService).role;
  readonly ownerRequestStatus = inject(AuthService).ownerRequestStatus;
}
