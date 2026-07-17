import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Property, PropertyQuery } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private base = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  getProperties(query?: PropertyQuery): Observable<Property[]> {
    let params = new HttpParams();
    if (query) {
      if (query.location)       params = params.set('location', query.location);
      if (query.minPrice != null) params = params.set('minPrice', query.minPrice);
      if (query.maxPrice != null) params = params.set('maxPrice', query.maxPrice);
      if (query.beds != null)   params = params.set('beds', query.beds);
      if (query.propertyType)   params = params.set('propertyType', query.propertyType);
      if (query.petsAllowed != null)    params = params.set('petsAllowed', query.petsAllowed);
      if (query.parkingIncluded != null) params = params.set('parkingIncluded', query.parkingIncluded);
    }
    return this.http.get<Property[]>(this.base, { params });
  }

  getProperty(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.base}/${id}`);
  }

  createProperty(data: Partial<Property> & { address: string; city: string; state: string; country: string; postalCode: string }): Observable<Property> {
    return this.http.post<Property>(this.base, data);
  }
}
