import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
    private authService: AuthService
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
        next: (user) => {
          this.isLoading = false;
          console.log('Login successful:', user);
          // Redirect based on user role
          if (user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password';
          } else if (error.status === 422) {
            this.errorMessage = 'Validation error. Please check your input.';
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
