import { Component, OnDestroy, OnInit, signal, inject, ElementRef, ViewChild, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { BoxAndWiskers, BoxPlotController } from '@sgratzl/chartjs-chart-boxplot';
import { ManagerService } from '../../../core/services/manager.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Application, Property } from '../../../core/models/models';
import { AnalyticsChartCardComponent } from '../../../shared/components/analytics-chart-card/analytics-chart-card.component';
import {
  AnalyticsRange,
  filterApplicationsByRange,
  filterPropertiesByRange,
  getMonthlyApplications,
  getMonthlyListings,
  getPropertyTypeCounts,
  getRentHistogram,
  getRentSamplesByType,
  getStatusCounts,
  getSummaryMetrics,
  toCsv
} from '../../../core/charts/analytics-metrics';
import {
  listingAndApplicationTimeSeriesConfig,
  rentBoxPlotChartConfig,
  rentHistogramChartConfig,
  statusBarChartConfig,
  statusChartConfig,
  typeChartConfig,
  typeDonutChartConfig
} from '../../../core/charts/chart-config.factory';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Title,
  Tooltip,
  BoxPlotController,
  BoxAndWiskers
);

type ChartKind = 'statusBar' | 'statusPie' | 'typeColumn' | 'typeDonut' | 'timeSeries' | 'histogram' | 'boxPlot';

@Component({
  selector: 'app-manager-analytics',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DecimalPipe,
    AnalyticsChartCardComponent
  ],
  template: `
    <div>
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <h1 class="text-2xl font-bold text-[#0A1A12]">Analytics</h1>
        <mat-form-field appearance="outline" class="w-full md:w-64">
          <mat-label>Time Range</mat-label>
          <mat-select [value]="selectedRange()" (valueChange)="onRangeChange($event)">
            <mat-option value="30d">Last 30 Days</mat-option>
            <mat-option value="90d">Last 90 Days</mat-option>
            <mat-option value="180d">Last 180 Days</mat-option>
            <mat-option value="365d">Last 365 Days</mat-option>
            <mat-option value="all">All Time</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <mat-progress-spinner mode="indeterminate" color="primary" />
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <mat-card class="p-4">
            <p class="text-sm text-[#5C6B63]">Total Properties</p>
            <p class="text-2xl font-semibold text-[#0A1A12] mt-1">{{ summary().totalProperties }}</p>
          </mat-card>
          <mat-card class="p-4">
            <p class="text-sm text-[#5C6B63]">Applications Received</p>
            <p class="text-2xl font-semibold text-[#0A1A12] mt-1">{{ summary().totalApplications }}</p>
          </mat-card>
          <mat-card class="p-4">
            <p class="text-sm text-[#5C6B63]">Avg Monthly Rent</p>
            <p class="text-2xl font-semibold text-[#0A1A12] mt-1">{{ summary().averageRent | number:'1.0-0' }}</p>
          </mat-card>
          <mat-card class="p-4">
            <p class="text-sm text-[#5C6B63]">Approval Rate</p>
            <p class="text-2xl font-semibold text-[#0A1A12] mt-1">{{ summary().approvalRate | number:'1.0-1' }}%</p>
          </mat-card>
          <mat-card class="p-4">
            <p class="text-sm text-[#5C6B63]">Avg Days To Decision</p>
            <p class="text-2xl font-semibold text-[#0A1A12] mt-1">{{ summary().avgDaysToDecision | number:'1.0-1' }}</p>
          </mat-card>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <app-analytics-chart-card
            [title]="'Applications by Status (Bar)'"
            [hasData]="filteredApplications().length > 0"
            [emptyText]="'No application data available for this range.'"
            (pngClick)="downloadChart('statusBar')"
            (csvClick)="downloadStatusCsv()"
          >
            <div class="h-[320px]">
              <canvas #statusBarChart></canvas>
            </div>
          </app-analytics-chart-card>

          <app-analytics-chart-card
            [title]="'Applications by Status (Pie)'"
            [hasData]="filteredApplications().length > 0"
            [emptyText]="'No application data available for this range.'"
            (pngClick)="downloadChart('statusPie')"
            (csvClick)="downloadStatusCsv()"
          >
            <div class="h-[320px]">
              <canvas #statusPieChart></canvas>
            </div>
          </app-analytics-chart-card>

          <app-analytics-chart-card
            [title]="'Properties by Type (Column)'"
            [hasData]="filteredProperties().length > 0"
            [emptyText]="'No property data available for this range.'"
            (pngClick)="downloadChart('typeColumn')"
            (csvClick)="downloadTypeCsv()"
          >
            <div class="h-[320px]">
              <canvas #typeColumnChart></canvas>
            </div>
          </app-analytics-chart-card>

          <app-analytics-chart-card
            [title]="'Properties by Type (Donut)'"
            [hasData]="filteredProperties().length > 0"
            [emptyText]="'No property data available for this range.'"
            (pngClick)="downloadChart('typeDonut')"
            (csvClick)="downloadTypeCsv()"
          >
            <div class="h-[320px]">
              <canvas #typeDonutChart></canvas>
            </div>
          </app-analytics-chart-card>

          <app-analytics-chart-card
            [title]="'Listings vs Applications (Time Series)'"
            [hasData]="filteredProperties().length > 0 || filteredApplications().length > 0"
            [emptyText]="'No trend data available for this range.'"
            [containerClass]="'xl:col-span-2'"
            (pngClick)="downloadChart('timeSeries')"
            (csvClick)="downloadMonthlyCsv()"
          >
            <div class="h-[340px]">
              <canvas #timeSeriesChart></canvas>
            </div>
          </app-analytics-chart-card>

          <app-analytics-chart-card
            [title]="'Rent Distribution (Histogram)'"
            [hasData]="filteredProperties().length > 0"
            [emptyText]="'No rent distribution data available for this range.'"
            (pngClick)="downloadChart('histogram')"
            (csvClick)="downloadHistogramCsv()"
          >
            <div class="h-[320px]">
              <canvas #histogramChart></canvas>
            </div>
          </app-analytics-chart-card>

          <app-analytics-chart-card
            [title]="'Rent Spread by Property Type (Box Plot)'"
            [hasData]="filteredProperties().length > 0"
            [emptyText]="'No box plot data available for this range.'"
            (pngClick)="downloadChart('boxPlot')"
            (csvClick)="downloadBoxPlotCsv()"
          >
            <div class="h-[320px]">
              <canvas #boxPlotChart></canvas>
            </div>
          </app-analytics-chart-card>
        </div>
      }
    </div>
  `
})
export class ManagerAnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild('statusBarChart')
  set statusBarChartRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this._statusBarChartRef = value;
    queueMicrotask(() => this.tryRenderCharts());
  }

  @ViewChild('statusPieChart')
  set statusPieChartRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this._statusPieChartRef = value;
    queueMicrotask(() => this.tryRenderCharts());
  }

  @ViewChild('typeColumnChart')
  set typeColumnChartRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this._typeColumnChartRef = value;
    queueMicrotask(() => this.tryRenderCharts());
  }

  @ViewChild('typeDonutChart')
  set typeDonutChartRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this._typeDonutChartRef = value;
    queueMicrotask(() => this.tryRenderCharts());
  }

  @ViewChild('timeSeriesChart')
  set timeSeriesChartRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this._timeSeriesChartRef = value;
    queueMicrotask(() => this.tryRenderCharts());
  }

  @ViewChild('histogramChart')
  set histogramChartRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this._histogramChartRef = value;
    queueMicrotask(() => this.tryRenderCharts());
  }

  @ViewChild('boxPlotChart')
  set boxPlotChartRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this._boxPlotChartRef = value;
    queueMicrotask(() => this.tryRenderCharts());
  }

  loading = signal(true);
  selectedRange = signal<AnalyticsRange>('180d');
  properties = signal<Property[]>([]);
  managerApplications = signal<Application[]>([]);

  filteredProperties = computed(() => filterPropertiesByRange(this.properties(), this.selectedRange()));
  filteredApplications = computed(() => filterApplicationsByRange(this.managerApplications(), this.selectedRange()));
  summary = computed(() => getSummaryMetrics(this.filteredProperties(), this.filteredApplications()));

  private readonly managerId = inject(AuthService).managerId;
  private readonly managerService = inject(ManagerService);
  private readonly applicationService = inject(ApplicationService);

  private _statusBarChartRef?: ElementRef<HTMLCanvasElement>;
  private _statusPieChartRef?: ElementRef<HTMLCanvasElement>;
  private _typeColumnChartRef?: ElementRef<HTMLCanvasElement>;
  private _typeDonutChartRef?: ElementRef<HTMLCanvasElement>;
  private _timeSeriesChartRef?: ElementRef<HTMLCanvasElement>;
  private _histogramChartRef?: ElementRef<HTMLCanvasElement>;
  private _boxPlotChartRef?: ElementRef<HTMLCanvasElement>;

  private statusBarChart?: Chart;
  private statusPieChart?: Chart;
  private typeColumnChart?: Chart;
  private typeDonutChart?: Chart;
  private timeSeriesChart?: Chart;
  private histogramChart?: Chart;
  private boxPlotChart?: Chart;

  ngOnInit(): void {
    const id = this.managerId();
    if (!id) {
      this.loading.set(false);
      return;
    }

    forkJoin({
      properties: this.managerService.getManagerProperties(id),
      applications: this.applicationService.getApplications()
    }).subscribe({
      next: ({ properties, applications }) => {
        const ownedPropertyIds = new Set(properties.map(property => property.id));
        const filteredApps = applications.filter(application => ownedPropertyIds.has(application.propertyId));

        this.properties.set(properties);
        this.managerApplications.set(filteredApps);
        this.loading.set(false);
        queueMicrotask(() => this.tryRenderCharts());
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyAllCharts();
  }

  onRangeChange(nextRange: AnalyticsRange): void {
    this.selectedRange.set(nextRange);
    queueMicrotask(() => this.tryRenderCharts());
  }

  downloadChart(kind: ChartKind): void {
    const chartMap: Record<ChartKind, Chart | undefined> = {
      statusBar: this.statusBarChart,
      statusPie: this.statusPieChart,
      typeColumn: this.typeColumnChart,
      typeDonut: this.typeDonutChart,
      timeSeries: this.timeSeriesChart,
      histogram: this.histogramChart,
      boxPlot: this.boxPlotChart
    };

    const chart = chartMap[kind];
    if (!chart) return;

    const dataUrl = chart.toBase64Image('image/png', 1);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${kind}-analytics-${this.selectedRange()}.png`;
    link.click();
  }

  downloadStatusCsv(): void {
    const counts = getStatusCounts(this.filteredApplications());
    const csv = toCsv(
      [
        ['Pending', counts.pending],
        ['Approved', counts.approved],
        ['Denied', counts.denied]
      ],
      ['Status', 'Count']
    );
    this.downloadCsvFile(csv, `status-analytics-${this.selectedRange()}.csv`);
  }

  downloadTypeCsv(): void {
    const counts = getPropertyTypeCounts(this.filteredProperties());
    const rows = Object.entries(counts).map(([type, count]) => [type, count]);
    const csv = toCsv(rows, ['PropertyType', 'Count']);
    this.downloadCsvFile(csv, `property-type-analytics-${this.selectedRange()}.csv`);
  }

  downloadMonthlyCsv(): void {
    const listingSeries = getMonthlyListings(this.filteredProperties(), 6);
    const applicationSeries = getMonthlyApplications(this.filteredApplications(), 6);
    const rows = listingSeries.labels.map((label, i) => [
      label,
      listingSeries.values[i] ?? 0,
      applicationSeries.values[i] ?? 0
    ]);
    const csv = toCsv(rows, ['Month', 'NewListings', 'Applications']);
    this.downloadCsvFile(csv, `monthly-series-analytics-${this.selectedRange()}.csv`);
  }

  downloadHistogramCsv(): void {
    const histogram = getRentHistogram(this.filteredProperties());
    const rows = histogram.labels.map((label, i) => [label, histogram.values[i] ?? 0]);
    const csv = toCsv(rows, ['RentRange', 'Properties']);
    this.downloadCsvFile(csv, `rent-histogram-${this.selectedRange()}.csv`);
  }

  downloadBoxPlotCsv(): void {
    const samples = getRentSamplesByType(this.filteredProperties());
    const rows = samples.labels.map((label, i) => [label, ...(samples.values[i] ?? [])]);
    const csv = toCsv(rows, ['PropertyType', 'RentSamples']);
    this.downloadCsvFile(csv, `rent-boxplot-${this.selectedRange()}.csv`);
  }

  private tryRenderCharts(): void {
    if (this.loading()) return;

    const applications = this.filteredApplications();
    const properties = this.filteredProperties();

    if (applications.length && this._statusBarChartRef) {
      this.statusBarChart?.destroy();
      this.statusBarChart = new Chart(this._statusBarChartRef.nativeElement, statusBarChartConfig(getStatusCounts(applications)));
    }

    if (applications.length && this._statusPieChartRef) {
      this.statusPieChart?.destroy();
      this.statusPieChart = new Chart(this._statusPieChartRef.nativeElement, statusChartConfig(getStatusCounts(applications)));
    }

    if (properties.length && this._typeColumnChartRef) {
      this.typeColumnChart?.destroy();
      this.typeColumnChart = new Chart(this._typeColumnChartRef.nativeElement, typeChartConfig(getPropertyTypeCounts(properties)));
    }

    if (properties.length && this._typeDonutChartRef) {
      this.typeDonutChart?.destroy();
      this.typeDonutChart = new Chart(this._typeDonutChartRef.nativeElement, typeDonutChartConfig(getPropertyTypeCounts(properties)));
    }

    if ((applications.length || properties.length) && this._timeSeriesChartRef) {
      const listingSeries = getMonthlyListings(properties, 6);
      const applicationSeries = getMonthlyApplications(applications, 6);
      this.timeSeriesChart?.destroy();
      this.timeSeriesChart = new Chart(
        this._timeSeriesChartRef.nativeElement,
        listingAndApplicationTimeSeriesConfig(listingSeries.labels, listingSeries.values, applicationSeries.values)
      );
    }

    if (properties.length && this._histogramChartRef) {
      const histogram = getRentHistogram(properties);
      this.histogramChart?.destroy();
      this.histogramChart = new Chart(this._histogramChartRef.nativeElement, rentHistogramChartConfig(histogram.labels, histogram.values));
    }

    if (properties.length && this._boxPlotChartRef) {
      const samples = getRentSamplesByType(properties);
      this.boxPlotChart?.destroy();
      this.boxPlotChart = new Chart(this._boxPlotChartRef.nativeElement, rentBoxPlotChartConfig(samples.labels, samples.values));
    }
  }

  private destroyAllCharts(): void {
    this.statusBarChart?.destroy();
    this.statusPieChart?.destroy();
    this.typeColumnChart?.destroy();
    this.typeDonutChart?.destroy();
    this.timeSeriesChart?.destroy();
    this.histogramChart?.destroy();
    this.boxPlotChart?.destroy();
  }

  private downloadCsvFile(csv: string, fileName: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
