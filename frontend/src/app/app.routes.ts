import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'properties/:id',
    loadComponent: () => import('./features/property-detail/property-detail.component').then(m => m.PropertyDetailComponent)
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'tenant',
    canActivate: [authGuard, roleGuard('tenant')],
    loadComponent: () => import('./shared/layout/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'favorites', pathMatch: 'full' },
      {
        path: 'favorites',
        loadComponent: () => import('./features/tenant/favorites/favorites.component').then(m => m.FavoritesComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/tenant/applications/applications.component').then(m => m.ApplicationsComponent)
      },
      {
        path: 'residences',
        loadComponent: () => import('./features/tenant/residences/residences.component').then(m => m.ResidencesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/tenant/settings/tenant-settings.component').then(m => m.TenantSettingsComponent)
      }
    ]
  },
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard('manager')],
    loadComponent: () => import('./shared/layout/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'properties', pathMatch: 'full' },
      {
        path: 'properties',
        loadComponent: () => import('./features/manager/properties/manager-properties.component').then(m => m.ManagerPropertiesComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/manager/applications/manager-applications.component').then(m => m.ManagerApplicationsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/manager/analytics/manager-analytics.component').then(m => m.ManagerAnalyticsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/manager/settings/manager-settings.component').then(m => m.ManagerSettingsComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./shared/layout/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'owner-requests', pathMatch: 'full' },
      {
        path: 'owner-requests',
        loadComponent: () => import('./features/admin/owner-requests/admin-owner-requests.component').then(m => m.AdminOwnerRequestsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
