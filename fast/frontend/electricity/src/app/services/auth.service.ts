import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  unit_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is stored in localStorage on initialization
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      // Attempt to fetch current user to validate token and populate user data
      this.fetchCurrentUser().subscribe({
        next: (user) => this.setCurrentUser(user),
        error: (error) => {
          console.error('Error fetching current user on app load:', error);
          console.error('Error details:', error.error);
          console.error('Error message:', error.message);
          this.logout(); // Logout if token is invalid or user cannot be fetched
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem('jwt_token', response.access_token);
          // User details will be fetched via /users/me after successful login
        })
      );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('currentUser'); // Also remove currentUser if it was stored
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  changePassword(changePasswordData: { username: string, current_password: string, new_password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, changePasswordData);
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      tap(user => this.setCurrentUser(user))
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }
}
