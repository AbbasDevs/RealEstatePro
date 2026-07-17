import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <mat-icon class="text-5xl text-primary-600 mb-2">home_work</mat-icon>
          <h1 class="text-2xl font-bold text-[#0A1A12]">Welcome Back</h1>
          <p class="text-[#5C6B63] text-sm mt-1">Sign in to your account</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email">
            <mat-icon matPrefix class="text-[#5C6B63]">email</mat-icon>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'"
                   formControlName="password" autocomplete="current-password">
            <mat-icon matPrefix class="text-[#5C6B63]">lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit"
                  class="w-full h-12 text-base"
                  [disabled]="loading || form.invalid">
            @if (loading) {
              <mat-spinner diameter="24" class="inline-block mr-2"></mat-spinner>
            }
            Sign In
          </button>
        </form>

        <p class="text-center text-sm text-[#5C6B63] mt-6">
          Don't have an account?
          <a routerLink="/auth/register" class="text-primary-600 font-medium hover:underline ml-1">Sign Up</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  loading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private snack: MatSnackBar) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login({ email: this.form.value.email!, password: this.form.value.password! }).subscribe({
      next: res => {
        this.router.navigate([
          res.role === 'admin' ? '/admin/owner-requests' : res.role === 'manager' ? '/manager/properties' : '/tenant/favorites'
        ]);
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? 'Login failed.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
