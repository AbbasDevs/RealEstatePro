import { ChartConfiguration } from 'chart.js';
import type { BoxPlotDataPoint } from '@sgratzl/chartjs-chart-boxplot';
import { StatusCounts } from './analytics-metrics';

const palette = {
  pending: '#F59E0B',
  approved: '#10B981',
  denied: '#EF4444',
  primary: '#0EA5E9',
  primaryLine: '#2563EB'
};

export function statusChartConfig(counts: StatusCounts): ChartConfiguration<'pie', number[], string> {
  return {
    type: 'pie',
    data: {
      labels: ['Pending', 'Approved', 'Denied'],
      datasets: [{
        data: [counts.pending, counts.approved, counts.denied],
        backgroundColor: [palette.pending, palette.approved, palette.denied]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  };
}

export function statusBarChartConfig(counts: StatusCounts): ChartConfiguration<'bar', number[], string> {
  return {
    type: 'bar',
    data: {
      labels: ['Pending', 'Approved', 'Denied'],
      datasets: [{
        label: 'Applications',
        data: [counts.pending, counts.approved, counts.denied],
        backgroundColor: [palette.pending, palette.approved, palette.denied]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  };
}

export function typeChartConfig(typeCounts: Record<string, number>): ChartConfiguration<'bar', number[], string> {
  return {
    type: 'bar',
    data: {
      labels: Object.keys(typeCounts),
      datasets: [{
        label: 'Properties',
        data: Object.values(typeCounts),
        backgroundColor: palette.primary
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  };
}

export function typeDonutChartConfig(typeCounts: Record<string, number>): ChartConfiguration<'doughnut', number[], string> {
  const labels = Object.keys(typeCounts);
  const values = Object.values(typeCounts);

  return {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#0EA5E9', '#2563EB', '#14B8A6', '#22C55E', '#F59E0B', '#EF4444']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  };
}

export function monthlyListingsChartConfig(labels: string[], values: number[]): ChartConfiguration<'line', number[], string> {
  return {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'New Listings',
        data: values,
        borderColor: palette.primaryLine,
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  };
}

export function listingAndApplicationTimeSeriesConfig(
  labels: string[],
  listingValues: number[],
  applicationValues: number[]
): ChartConfiguration<'line', number[], string> {
  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'New Listings',
          data: listingValues,
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: false,
          tension: 0.35,
          pointRadius: 3
        },
        {
          label: 'Applications',
          data: applicationValues,
          borderColor: '#0EA5E9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: false,
          tension: 0.35,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  };
}

export function rentHistogramChartConfig(labels: string[], values: number[]): ChartConfiguration<'bar', number[], string> {
  return {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Properties',
        data: values,
        backgroundColor: '#14B8A6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  };
}

export function rentBoxPlotChartConfig(labels: string[], values: number[][]): ChartConfiguration<'boxplot', BoxPlotDataPoint[], string> {
  return {
    type: 'boxplot',
    data: {
      labels,
      datasets: [{
        label: 'Rent Distribution',
        data: values as BoxPlotDataPoint[],
        backgroundColor: 'rgba(37, 99, 235, 0.35)',
        borderColor: '#2563EB',
        borderWidth: 1.5,
        outlierBackgroundColor: '#EF4444',
        outlierBorderColor: '#B91C1C'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Monthly Rent ($)'
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  };
}
