import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analytics-chart-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="p-4" [class]="containerClass">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-[#0A1A12]">{{ title }}</h2>
        <div class="flex gap-2">
          <button mat-stroked-button type="button" (click)="pngClick.emit()">
            <mat-icon>download</mat-icon> PNG
          </button>
          <button mat-stroked-button type="button" (click)="csvClick.emit()">
            <mat-icon>table_view</mat-icon> CSV
          </button>
        </div>
      </div>

      @if (!hasData) {
        <p class="text-sm text-[#5C6B63] py-20 text-center">{{ emptyText }}</p>
      } @else {
        <ng-content />
      }
    </mat-card>
  `
})
export class AnalyticsChartCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) emptyText!: string;
  @Input() hasData = false;
  @Input() containerClass = '';

  @Output() pngClick = new EventEmitter<void>();
  @Output() csvClick = new EventEmitter<void>();
}