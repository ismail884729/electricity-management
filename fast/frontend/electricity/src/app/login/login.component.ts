import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse, User } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService // Inject UserService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Any initialization logic
  }

  // Getters for form controls for easier access in the template
  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;
    
    // For testing with the specific user "juma"
    console.log(`Attempting login with ${username}`);
    this.authService.login({ username, password })
      .subscribe({
        next: (response: LoginResponse) => { // Use LoginResponse type
          console.log('Login successful, token received:', response.access_token);
          // Now fetch user details using the new /users/me endpoint
          this.userService.getMe().subscribe({
            next: (user: User) => { // Use User type
              this.isLoading = false;
              this.authService.setCurrentUser(user); // Store the full user object
              console.log('User profile fetched:', user);
              // Redirect based on user role
              if (user.role === 'admin') {
                this.router.navigate(['/admin/dashboard']);
              } else {
                this.router.navigate(['/user/dashboard']);
              }
            },
            error: (userError: HttpErrorResponse) => {
              this.isLoading = false;
              this.errorMessage = 'Failed to fetch user profile after login.';
              console.error('Error fetching user profile:', userError);
              console.error('User profile error details:', userError.error); // Log the actual error body
              console.error('User profile error message:', userError.message); // Log the error message
              this.authService.logout(); // Log out if profile fetch fails
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password';
          } else {
            this.errorMessage = 'Login failed. Please try again later.';
          }
          console.error('Login error:', error);
        }
      });
  }

  // forgotPassword() {
  //   // Implement later
  //   console.log('Forgot password clicked');
  // }
}
