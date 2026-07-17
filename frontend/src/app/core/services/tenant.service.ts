import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Application, Tenant } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private base = `${environment.apiUrl}/tenants`;

  constructor(private http: HttpClient) {}

  getTenant(id: number): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.base}/${id}`);
  }

  updateTenant(id: number, data: { name: string; email: string; phoneNumber: string }): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.base}/${id}`, data);
  }

  getCurrentResidences(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${id}/current-residences`);
  }

  addFavorite(tenantId: number, propertyId: number): Observable<Tenant> {
    return this.http.post<Tenant>(`${this.base}/${tenantId}/favorites/${propertyId}`, {});
  }

  removeFavorite(tenantId: number, propertyId: number): Observable<Tenant> {
    return this.http.delete<Tenant>(`${this.base}/${tenantId}/favorites/${propertyId}`);
  }
}
