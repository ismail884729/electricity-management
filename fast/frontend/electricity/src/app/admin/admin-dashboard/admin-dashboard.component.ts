import { Component, OnInit } from '@angular/core';
import { AdminService, DashboardStats } from '../../services/admin.service';
import { Transaction } from '../../services/user.service'; // Import Transaction interface
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentTransactions: Transaction[] = []; // Re-introduce recentTransactions

  // Chart data (keeping dummy data for now as no API for this was provided)
  consumptionData = [65, 59, 80, 81, 56, 55, 72];
  timeLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.showLoadingAlert('Loading Dashboard Stats...');
    this.adminService.getDashboardStats().subscribe({
      next: (response: DashboardStats) => { // Type as DashboardStats directly
        console.log('API Response:', response); // Log the full response
        Swal.close();
        this.stats = response; // Assign the response directly
        this.recentTransactions = response.recent_transactions; // Assign recent transactions
        this.showSuccessAlert('Dashboard stats loaded successfully!');
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to load dashboard stats.', err.message);
      }
    });
  }

  updateDateRange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    // In a real application, this would update the dashboard data based on the selected range
    console.log('Selected date range:', selectedValue);
  }

  private showLoadingAlert(message: string): void {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  private showSuccessAlert(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  private showErrorAlert(title: string, message: string): void {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message
    });
  }
}
