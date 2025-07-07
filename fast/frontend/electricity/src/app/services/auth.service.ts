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
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((user) => {
          // Store user details and token in local storage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  changePassword(changePasswordData: { username: string, current_password: string, new_password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, changePasswordData);
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  getToken(): string | null {
    // Get the token from the user object if it exists
    // Note: If your FastAPI backend sends a separate token in the response,
    // update this method to retrieve it properly
    const user = this.getCurrentUser();
    
    // If the backend sends a token in the response, it should be stored separately
    // For now we'll use a simple approach for testing
    return user ? 'dummy-token' : null;
    
    // Uncomment this if your FastAPI backend includes an actual token in the response:
    // const token = localStorage.getItem('auth_token');
    // return token;
  }
}
