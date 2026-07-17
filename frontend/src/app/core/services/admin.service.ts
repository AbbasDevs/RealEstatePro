import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { OwnerRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getOwnerRequests(): Observable<OwnerRequest[]> {
    return this.http.get<OwnerRequest[]>(`${this.base}/owner-requests`);
  }

  approveOwnerRequest(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/owner-requests/${userId}/approve`, {});
  }

  rejectOwnerRequest(userId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/owner-requests/${userId}/reject`, {});
  }
}