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
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <mat-icon class="text-5xl text-primary-600 mb-2">home_work</mat-icon>
          <h1 class="text-2xl font-bold text-[#0A1A12]">Create Account</h1>
          <p class="text-[#5C6B63] text-sm mt-1">Join thousands of users today</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" autocomplete="name">
            <mat-icon matPrefix class="text-[#5C6B63]">person</mat-icon>
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email">
            <mat-icon matPrefix class="text-[#5C6B63]">email</mat-icon>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phoneNumber" autocomplete="tel">
            <mat-icon matPrefix class="text-[#5C6B63]">phone</mat-icon>
          </mat-form-field>

          <mat-form-field class="w-full" appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPwd ? 'text' : 'password'"
                   formControlName="password" autocomplete="new-password">
            <mat-icon matPrefix class="text-[#5C6B63]">lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showPwd = !showPwd">
              <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <mat-error>Password must be at least 8 characters</mat-error>
            }
          </mat-form-field>

          <label class="block rounded-xl border border-[#c7d6cd] px-4 py-3 bg-[#FCFDFB] text-sm text-[#0A1A12]">
            <span class="font-medium text-[#0A1A12] block mb-1">Request owner access</span>
            <span class="block mb-3 text-[#5C6B63]">All new accounts start as tenants. If you want to list properties, an admin must approve your owner request first.</span>
            <label class="flex items-center gap-3">
              <input type="checkbox" formControlName="requestOwnerAccess" class="h-4 w-4">
              <span>I want to be reviewed as a property owner</span>
            </label>
          </label>

          <button mat-raised-button color="primary" type="submit"
                  class="w-full h-12 text-base"
                  [disabled]="loading || form.invalid">
            @if (loading) {
              <mat-spinner diameter="24" class="inline-block mr-2"></mat-spinner>
            }
            Create Account
          </button>
        </form>

        <p class="text-center text-sm text-[#5C6B63] mt-6">
          Already have an account?
          <a routerLink="/auth/login" class="text-primary-600 font-medium hover:underline ml-1">Sign In</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = this.fb.group({
    name:        ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    password:    ['', [Validators.required, Validators.minLength(8)]],
    requestOwnerAccess: [false]
  });
  loading = false;
  showPwd = false;

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private snack: MatSnackBar) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.value;
    this.auth.register({
      name: v.name!, email: v.email!, phoneNumber: v.phoneNumber!,
      password: v.password!, requestOwnerAccess: !!v.requestOwnerAccess
    }).subscribe({
      next: res => {
        const message = res.ownerRequestStatus === 'pending'
          ? 'Account created. Your owner request is pending admin approval.'
          : 'Account created.';
        this.snack.open(message, 'Close', { duration: 3500 });
        this.router.navigate(['/tenant/favorites']);
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? 'Registration failed.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
