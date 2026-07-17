import { Application, Property } from '../models/models';

export type AnalyticsRange = '30d' | '90d' | '180d' | '365d' | 'all';

export interface StatusCounts {
  pending: number;
  approved: number;
  denied: number;
}

export interface SummaryMetrics {
  totalProperties: number;
  totalApplications: number;
  averageRent: number;
  approvalRate: number;
  avgDaysToDecision: number;
}

export interface MonthlySeries {
  labels: string[];
  values: number[];
}

export interface HistogramSeries {
  labels: string[];
  values: number[];
}

function normalizeStatus(status: unknown): 'Pending' | 'Denied' | 'Approved' {
  if (status === 'Approved' || status === 2) return 'Approved';
  if (status === 'Denied' || status === 1) return 'Denied';
  return 'Pending';
}

function normalizePropertyType(type: unknown): string {
  if (typeof type === 'string') return type;

  const map: Record<number, string> = {
    0: 'Rooms',
    1: 'Tinyhouse',
    2: 'Apartment',
    3: 'Villa',
    4: 'Townhouse',
    5: 'Cottage'
  };

  return map[Number(type)] ?? 'Unknown';
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function cutoffDateFromRange(range: AnalyticsRange): Date | null {
  if (range === 'all') return null;

  const days = {
    '30d': 30,
    '90d': 90,
    '180d': 180,
    '365d': 365
  }[range];

  return new Date(Date.now() - days * MS_PER_DAY);
}

export function filterPropertiesByRange(properties: Property[], range: AnalyticsRange): Property[] {
  const cutoff = cutoffDateFromRange(range);
  if (!cutoff) return properties;

  return properties.filter(property => {
    const createdAt = new Date(property.postedDate);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= cutoff;
  });
}

export function filterApplicationsByRange(applications: Application[], range: AnalyticsRange): Application[] {
  const cutoff = cutoffDateFromRange(range);
  if (!cutoff) return applications;

  return applications.filter(application => {
    const createdAt = new Date(application.applicationDate);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= cutoff;
  });
}

export function getStatusCounts(applications: Application[]): StatusCounts {
  return applications.reduce<StatusCounts>((acc, app) => {
    const status = normalizeStatus(app.status);
    if (status === 'Approved') acc.approved += 1;
    else if (status === 'Denied') acc.denied += 1;
    else acc.pending += 1;
    return acc;
  }, { pending: 0, approved: 0, denied: 0 });
}

export function getPropertyTypeCounts(properties: Property[]): Record<string, number> {
  return properties.reduce<Record<string, number>>((acc, property) => {
    const type = normalizePropertyType(property.propertyType);
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});
}

export function getMonthlyListings(properties: Property[], monthWindow = 6): { labels: string[]; values: number[] } {
  const now = new Date();
  const labels: string[] = [];
  const counters = new Map<string, number>();

  for (let i = monthWindow - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    labels.push(d.toLocaleString('en-US', { month: 'short' }));
    counters.set(key, 0);
  }

  for (const property of properties) {
    const createdAt = new Date(property.postedDate);
    if (Number.isNaN(createdAt.getTime())) continue;
    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    if (counters.has(key)) {
      counters.set(key, (counters.get(key) ?? 0) + 1);
    }
  }

  return { labels, values: Array.from(counters.values()) };
}

export function getMonthlyApplications(applications: Application[], monthWindow = 6): MonthlySeries {
  const now = new Date();
  const labels: string[] = [];
  const counters = new Map<string, number>();

  for (let i = monthWindow - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    labels.push(d.toLocaleString('en-US', { month: 'short' }));
    counters.set(key, 0);
  }

  for (const application of applications) {
    const createdAt = new Date(application.applicationDate);
    if (Number.isNaN(createdAt.getTime())) continue;
    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    if (counters.has(key)) {
      counters.set(key, (counters.get(key) ?? 0) + 1);
    }
  }

  return { labels, values: Array.from(counters.values()) };
}

export function getRentHistogram(properties: Property[], bins = 7): HistogramSeries {
  const rents = properties
    .map(property => property.pricePerMonth)
    .filter(rent => Number.isFinite(rent) && rent > 0)
    .sort((a, b) => a - b);

  if (!rents.length) {
    return { labels: [], values: [] };
  }

  const min = rents[0];
  const max = rents[rents.length - 1];
  const width = Math.max(1, Math.ceil((max - min + 1) / bins));
  const counts = new Array(bins).fill(0);
  const labels = new Array<string>(bins);

  for (let i = 0; i < bins; i += 1) {
    const start = min + i * width;
    const end = i === bins - 1 ? max : start + width - 1;
    labels[i] = `$${Math.round(start)}-$${Math.round(end)}`;
  }

  for (const rent of rents) {
    const idx = Math.min(bins - 1, Math.floor((rent - min) / width));
    counts[idx] += 1;
  }

  return { labels, values: counts };
}

export function getRentSamplesByType(properties: Property[]): { labels: string[]; values: number[][] } {
  const typeMap = new Map<string, number[]>();

  for (const property of properties) {
    const type = normalizePropertyType(property.propertyType);
    if (!typeMap.has(type)) {
      typeMap.set(type, []);
    }
    typeMap.get(type)!.push(property.pricePerMonth);
  }

  const sortedTypes = Array.from(typeMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  return {
    labels: sortedTypes.map(([type]) => type),
    values: sortedTypes.map(([, rents]) => rents)
  };
}

export function getSummaryMetrics(properties: Property[], applications: Application[]): SummaryMetrics {
  const totalProperties = properties.length;
  const totalApplications = applications.length;
  const totalRent = properties.reduce((sum, property) => sum + property.pricePerMonth, 0);
  const averageRent = totalProperties ? totalRent / totalProperties : 0;

  const decided = applications.filter(app => {
    const status = normalizeStatus(app.status);
    return status === 'Approved' || status === 'Denied';
  });
  const approved = applications.filter(app => normalizeStatus(app.status) === 'Approved').length;
  const approvalRate = decided.length ? (approved / decided.length) * 100 : 0;

  const decisionDurations = decided
    .map(app => {
      const createdAt = new Date(app.applicationDate);
      if (Number.isNaN(createdAt.getTime())) return null;

      const decisionSource = app.decisionDate ? new Date(app.decisionDate) : new Date();
      if (Number.isNaN(decisionSource.getTime())) return null;

      return (decisionSource.getTime() - createdAt.getTime()) / MS_PER_DAY;
    })
    .filter((days): days is number => days !== null);

  const avgDaysToDecision = decisionDurations.length
    ? decisionDurations.reduce((sum, days) => sum + days, 0) / decisionDurations.length
    : 0;

  return {
    totalProperties,
    totalApplications,
    averageRent,
    approvalRate,
    avgDaysToDecision
  };
}

export function toCsv(rows: Array<Array<string | number>>, headers: string[]): string {
  const escape = (value: string | number) => {
    const text = String(value);
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
  };

  const csvRows = [headers.map(escape).join(',')];
  for (const row of rows) {
    csvRows.push(row.map(escape).join(','));
  }
  return csvRows.join('\n');
}
