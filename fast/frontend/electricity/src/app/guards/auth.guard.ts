import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if (this.authService.isLoggedIn()) {
      // If a token exists, try to fetch user data to validate the token
      return this.authService.fetchCurrentUser().pipe(
        map(user => {
          if (user) {
            return true; // User data fetched successfully, token is valid
          } else {
            // This case should ideally be handled by the error pipe, but as a fallback
            this.authService.logout();
            return this.router.createUrlTree(['/login']);
          }
        }),
        catchError(() => {
          // If fetching user fails (e.g., 401 Unauthorized), logout and redirect
          this.authService.logout();
          return of(this.router.createUrlTree(['/login']));
        })
      );
    } else {
      // No token found, redirect to the login page
      return this.router.createUrlTree(['/login']);
    }
  }
}
