import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Application } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private base = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(this.base);
  }

  createApplication(data: {
    propertyId: number;
    message: string;
    name: string;
    email: string;
    phoneNumber: string;
  }): Observable<Application> {
    return this.http.post<Application>(this.base, data);
  }

  updateStatus(id: number, status: string): Observable<Application> {
    return this.http.put<Application>(`${this.base}/${id}/status`, { status });
  }
}
