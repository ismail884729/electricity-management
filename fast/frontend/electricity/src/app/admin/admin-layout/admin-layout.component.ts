import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  adminName: string = 'Admin User';
  currentUser: User | null = null;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Get the current authenticated admin user
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.adminName = this.currentUser.full_name || this.currentUser.username;
    }
    
    // Subscribe to changes in the current user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.adminName = user.full_name || user.username;
      }
    });
  }

  logout(): void {
    // Use the auth service to handle logout
    this.authService.logout();
  }
}
