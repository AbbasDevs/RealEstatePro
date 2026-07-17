import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Application, Manager, Property } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private base = `${environment.apiUrl}/managers`;

  constructor(private http: HttpClient) {}

  getManager(id: number): Observable<Manager> {
    return this.http.get<Manager>(`${this.base}/${id}`);
  }

  updateManager(id: number, data: { name: string; email: string; phoneNumber: string }): Observable<Manager> {
    return this.http.put<Manager>(`${this.base}/${id}`, data);
  }

  getManagerProperties(id: number): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.base}/${id}/properties`);
  }
}
