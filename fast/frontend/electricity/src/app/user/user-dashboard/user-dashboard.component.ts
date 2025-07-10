import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';
import { Device, Transaction, UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

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
  userDevices: Device[] = [];
  recentTransactions: Transaction[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Get the current user from auth service
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to changes in the current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) { // Add null check for user
        this.loadUserDevices(user.id);
        this.loadRecentTransactions(user.id); // Load recent transactions
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

    // Explicitly fetch current user on dashboard load to ensure latest balance
    this.authService.fetchCurrentUser().subscribe({
      next: (user) => {
        console.log('Dashboard initialized with latest user data:', user.unit_balance);
        this.loadUserDevices(user.id); // Also load devices on initial fetch
        this.loadRecentTransactions(user.id); // Also load recent transactions on initial fetch
      },
      error: (err) => {
        console.error('Error fetching user data on dashboard init:', err);
      }
    });
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
  
  // Helper method to format currency
  formatCurrency(amount: number | undefined, currencySymbol: string = 'TSh'): string {
    if (amount === undefined) return `${currencySymbol} 0`;
    return `${currencySymbol} ` + amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  // Helper method to format units in kWh
  formatUnits(units: number | undefined): string {
    if (units === undefined) return '0 kWh';
    return units.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' kWh';
  }

  loadUserDevices(userId: number): void {
    this.userService.getUserDevices(userId).subscribe({
      next: (devices) => {
        this.userDevices = devices;
      },
      error: (error) => {
        console.error('Error loading user devices:', error);
      }
    });
  }

  loadRecentTransactions(userId: number): void {
    this.userService.getUserTransactions(userId, 0, 5).subscribe({ // Fetch top 5 transactions
      next: (transactions) => {
        this.recentTransactions = transactions;
      },
      error: (error) => {
        console.error('Error loading recent transactions:', error);
      }
    });
  }

  getStatusBadge(status: string): string {
    const badges = {
      'Completed': '<span class="status success">✅ Completed</span>',
      'Pending': '<span class="status pending">⏳ Pending</span>',
      'Failed': '<span class="status failed">❌ Failed</span>'
    };
    return badges[status as keyof typeof badges] || `<span class="status">${status}</span>`;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Completed': '✅',
      'Pending': '⏳',
      'Failed': '❌'
    };
    return icons[status] || '⚪';
  }

  refreshBalance() {
    Swal.fire({
      title: 'Refreshing Balance...',
      text: 'Please wait while we fetch your latest account balance.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.userService.getMe().subscribe({ // Changed to getMe()
      next: (user: User) => { // Explicitly type user as User
        this.currentUser = user;
        this.authService.setCurrentUser(user);
        Swal.fire({
          title: 'Balance Refreshed!',
          text: `Your new balance is ${this.formatCurrency(user.unit_balance)}.`,
          icon: 'success',
          confirmButtonColor: '#00897b'
        });
      },
      error: (error: any) => { // Explicitly type error as any
        console.error('Error refreshing balance:', error);
        Swal.fire({
          title: 'Error',
          text: 'Unable to refresh your balance. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
