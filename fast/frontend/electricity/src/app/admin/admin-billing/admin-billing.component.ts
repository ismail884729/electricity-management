import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService } from '../../services/admin.service';
import { Transaction } from '../../services/user.service'; // Bills are now transactions

@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.css']
})
export class AdminBillingComponent implements OnInit {
  bills: Transaction[] = []; // Bills are now transactions
  filteredBills: Transaction[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  selectedStatus: string = 'all';
  totalAmount: number = 0;
  totalTransactions: number = 0;
  averageTransactionValue: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadBills();
    this.loadBillingStatistics();
  }

  loadBills(): void {
    this.showLoadingAlert('Loading Bills...');
    const params = {
      skip: (this.currentPage - 1) * 10, // Assuming page size of 10
      limit: 10,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      // Add other filters if needed, e.g., payment_method, start_date, end_date
    };

    this.adminService.getBillingTransactions(params).subscribe({
      next: (transactions) => {
        Swal.close();
        this.bills = transactions;
        this.filteredBills = transactions; // Assuming API returns filtered/paginated data
        this.totalPages = Math.ceil(this.bills.length / 10); // Adjust if API provides total count
        this.showSuccessAlert('Bills loaded successfully!');
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to load bills.', err.message);
      }
    });
  }

  loadBillingStatistics(): void {
    this.adminService.getBillingStatistics().subscribe({
      next: (stats) => {
        this.totalAmount = stats.total_revenue;
        this.totalTransactions = stats.total_transactions;
        this.averageTransactionValue = stats.average_transaction_value;
      },
      error: (err) => {
        console.error('Failed to load billing statistics:', err);
        // Optionally show an error alert here if critical
      }
    });
  }

  searchBills(): void {
    this.loadBills(); // Trigger reload with search term
  }

  filterByStatus(): void {
    this.loadBills(); // Trigger reload with status filter
  }

  viewBillDetails(bill: Transaction): void {
    this.showSuccessAlert(`Viewing details for transaction: ${bill.transaction_reference}`);
    // In a real app, this would show detailed transaction information
  }

  editBill(bill: Transaction): void {
    this.showSuccessAlert(`Editing transaction: ${bill.transaction_reference}`);
    // In a real app, this would open an edit modal or navigate to edit page
  }

  sendReminder(bill: Transaction): void {
    this.showLoadingAlert(`Sending reminder for transaction: ${bill.transaction_reference}...`);
    // Assuming there's no direct API for sending reminders for transactions,
    // this would be a mock or require a new API endpoint.
    setTimeout(() => {
      Swal.close();
      this.showSuccessAlert(`Reminder sent for transaction: ${bill.transaction_reference}`);
    }, 1000);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadBills(); // Load new page of bills
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
