import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-apply-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title class="text-xl font-semibold">Apply for {{ data.propertyName }}</h2>
    <mat-dialog-content class="min-w-[400px]">
      <form [formGroup]="form" class="flex flex-col gap-4 pt-2">
        <mat-form-field appearance="outline">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name">
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Phone Number</mat-label>
          <input matInput formControlName="phoneNumber">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Message (optional)</mat-label>
          <textarea matInput rows="3" formControlName="message"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="submitting || form.invalid">
        {{ submitting ? 'Submitting...' : 'Submit Application' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ApplyDialogComponent {
  readonly data = inject<{ propertyId: number; propertyName: string }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ApplyDialogComponent>);
  private fb = inject(FormBuilder);
  private appService = inject(ApplicationService);
  private snack = inject(MatSnackBar);
  private auth = inject(AuthService);

  form = this.fb.group({
    name:        ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    message:     ['']
  });
  submitting = false;

  constructor() {
    const user = this.auth.authUser();
    if (user) this.form.patchValue({ email: user.email });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    const v = this.form.value;
    this.appService.createApplication({
      propertyId: this.data.propertyId,
      name: v.name!,
      email: v.email!,
      phoneNumber: v.phoneNumber!,
      message: v.message ?? ''
    }).subscribe({
      next: () => {
        this.snack.open('Application submitted!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snack.open(err?.error?.message ?? 'Failed to submit.', 'Close', { duration: 4000 });
        this.submitting = false;
      }
    });
  }
}
