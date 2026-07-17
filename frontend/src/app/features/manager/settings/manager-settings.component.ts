import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ManagerService } from '../../../core/services/manager.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-manager-settings',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="max-w-lg">
      <h1 class="text-2xl font-bold text-[#0A1A12] mb-6">Profile Settings</h1>

      @if (loading()) {
        <div class="flex justify-center py-16"><mat-progress-spinner mode="indeterminate" color="primary" /></div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm p-6">
          <form [formGroup]="form" (ngSubmit)="save()">
            <mat-form-field class="w-full mb-4" appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>
            <mat-form-field class="w-full mb-4" appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>
            <mat-form-field class="w-full mb-6" appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" [disabled]="saving || form.invalid">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>
      }
    </div>
  `
})
export class ManagerSettingsComponent implements OnInit {
  form = this.fb.group({
    name:        ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required]
  });
  loading = signal(true);
  saving = false;
  private managerService = inject(ManagerService);
  private managerId = inject(AuthService).managerId;
  private snack = inject(MatSnackBar);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const id = this.managerId();
    if (!id) return;
    this.managerService.getManager(id).subscribe({
      next: m => {
        this.form.patchValue({ name: m.name, email: m.email, phoneNumber: m.phoneNumber });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  save(): void {
    const id = this.managerId();
    if (!id || this.form.invalid) return;
    this.saving = true;
    this.managerService.updateManager(id, this.form.value as any).subscribe({
      next: () => { this.snack.open('Settings saved!', 'Close', { duration: 2000 }); this.saving = false; },
      error: () => { this.snack.open('Failed to save.', 'Close', { duration: 3000 }); this.saving = false; }
    });
  }
}
