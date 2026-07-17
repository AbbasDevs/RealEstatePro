import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models/models';

const TOKEN_KEY = 're_token';
const USER_KEY  = 're_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _auth = signal<AuthResponse | null>(this.loadStoredUser());

  readonly authUser   = this._auth.asReadonly();
  readonly isLoggedIn = computed(() => this._auth() !== null);
  readonly role       = computed(() => this._auth()?.role ?? null);
  readonly tenantId   = computed(() => this._auth()?.tenantId ?? null);
  readonly managerId  = computed(() => this._auth()?.managerId ?? null);
  readonly ownerRequestStatus = computed(() => this._auth()?.ownerRequestStatus ?? 'none');

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap(res => this.storeAuth(res)));
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(res => this.storeAuth(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._auth.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this._auth.set(res);
  }

  private loadStoredUser(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}
