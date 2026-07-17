export type PropertyType = 'Rooms' | 'Tinyhouse' | 'Apartment' | 'Villa' | 'Townhouse' | 'Cottage';
export type ApplicationStatus = 'Pending' | 'Denied' | 'Approved';
export type PaymentStatus = 'Pending' | 'Paid' | 'PartiallyPaid' | 'Overdue';
export type UserRole = 'tenant' | 'manager' | 'admin';
export type OwnerRequestStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Location {
  id: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Property {
  id: number;
  name: string;
  description: string;
  pricePerMonth: number;
  securityDeposit: number;
  applicationFee: number;
  photoUrls: string[];
  amenities: string[];
  highlights: string[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: PropertyType;
  postedDate: string;
  averageRating?: number;
  numberOfReviews?: number;
  locationId: number;
  managerId: string;
  location?: Location;
  manager?: Manager;
}

export interface Manager {
  id: number;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Tenant {
  id: number;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  favorites?: Property[];
  applications?: Application[];
}

export interface Application {
  id: number;
  applicationDate: string;
  decisionDate?: string | null;
  status: ApplicationStatus;
  message: string;
  name: string;
  email: string;
  phoneNumber: string;
  propertyId: number;
  tenantId: number;
  property?: Property;
  tenant?: Tenant;
}

export interface Lease {
  id: number;
  startDate: string;
  endDate: string;
  rent: number;
  deposit: number;
  propertyId: number;
  tenantId: number;
  property?: Property;
}

// Auth models
export interface AuthResponse {
  token: string;
  email: string;
  role: UserRole;
  tenantId?: number;
  managerId?: number;
  ownerRequestStatus: OwnerRequestStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  requestOwnerAccess: boolean;
}

export interface OwnerRequest {
  userId: number;
  email: string;
  tenantId?: number;
  managerId?: number;
  name: string;
  phoneNumber: string;
  status: OwnerRequestStatus;
}

export interface PropertyQuery {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  propertyType?: PropertyType;
  petsAllowed?: boolean;
  parkingIncluded?: boolean;
}
