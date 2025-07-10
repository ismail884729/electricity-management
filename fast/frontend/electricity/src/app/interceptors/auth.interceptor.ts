import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core'; // Import Injector
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector, // Inject Injector
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Lazily get AuthService to break circular dependency
    const authService = this.injector.get(AuthService);

    // Add auth header with token if user is logged in
    const token = authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized responses
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          authService.logout();
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: this.router.url } 
          });
        } else if (error.status === 200 && error.error instanceof SyntaxError) {
          // This is a parsing error where the response is not JSON, but the status is 200 OK
          console.error('Parsing error (status 200 OK):', error);
          console.error('Error status:', error.status);
          console.error('Error statusText:', error.statusText);
          console.error('Error URL:', error.url);
          console.error('Error message:', error.message);
          console.error('Raw response body (parsing error):', error.error); // error.error contains the raw response for parsing errors
        } else if (error.error instanceof ProgressEvent) {
          // This is a true network error (e.g., CORS, no internet)
          console.error('Network error:', error);
          console.error('Error status:', error.status);
          console.error('Error statusText:', error.statusText);
          console.error('Error URL:', error.url);
          console.error('Error message:', error.message);
        } else {
          // Other HTTP errors (e.g., 400, 500)
          console.error('Backend error:', error);
          console.error('Error status:', error.status);
          console.error('Error statusText:', error.statusText);
          console.error('Error URL:', error.url);
          console.error('Error message:', error.message);
          console.error('Error object:', error.error); // This will contain the backend's error response if it's JSON
        }
        
        return throwError(() => error);
      })
    );
  }
}
