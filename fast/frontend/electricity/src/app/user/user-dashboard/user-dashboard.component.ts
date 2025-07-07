import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  activePage: string = 'dashboard';
  isRootRoute: boolean = true;
  currentUser: User | null = null;
  lastPaymentDate: string = 'July 3, 2025'; // Default value
  currentUsage: number = 245; // Default value in kWh
  estimatedDaysRemaining: number = 5; // Default value
  // Average electricity cost per kWh in TSh
  averageKWhCost: number = 100; // Estimated cost per kWh

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get the current user from auth service
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to changes in the current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // If we have user data, calculate estimated days remaining based on money balance
      if (user && user.unit_balance) {
        // Assuming average daily consumption of 30 kWh at the cost of averageKWhCost TSh per kWh
        const averageDailyConsumption = 30; // kWh per day
        const averageDailyCost = averageDailyConsumption * this.averageKWhCost; // TSh per day
        this.estimatedDaysRemaining = Math.floor(user.unit_balance / averageDailyCost);
      }
    });
    
    // Subscribe to router events to detect navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActivePage();
    });

    // Set initial active page and route state
    this.updateActivePage();
  }

  updateActivePage() {
    // Get the current URL
    const url = this.router.url;
    
    // Check if we're at the root user dashboard route
    this.isRootRoute = url === '/user/dashboard';
    
    // Determine active page based on URL
    if (url.includes('/profile')) {
      this.activePage = 'profile';
    } else if (url.includes('/devices')) {
      this.activePage = 'devices';
    } else if (url.includes('/transactions')) {
      this.activePage = 'transactions';
    } else if (url.includes('/buy-electricity')) {
      this.activePage = 'buy-electricity';
    } else if (url.includes('/statistics')) {
      this.activePage = 'statistics';
    } else if (url.includes('/support')) {
      this.activePage = 'support';
    } else {
      this.activePage = 'dashboard';
    }
  }

  logout() {
    // Use the auth service to handle logout
    this.authService.logout();
  }

  // Helper method to get the user's first name
  getUserFirstName(): string {
    if (this.currentUser && this.currentUser.full_name) {
      return this.currentUser.full_name.split(' ')[0];
    }
    return 'User';
  }
  
  // Helper method to format currency in TSh
  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return 'TSh 0';
    return 'TSh ' + amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
