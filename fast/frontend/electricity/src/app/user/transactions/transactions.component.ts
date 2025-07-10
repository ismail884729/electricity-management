import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Device, Transaction, UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  searchText: string = '';
  statusFilter: string = 'all';
  isLoading = false;
  
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    
    // Show loading SweetAlert
    Swal.fire({
      title: 'Loading Transactions',
      text: 'Please wait while we fetch your transaction history...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserTransactions(currentUser.id).subscribe({
        next: (data) => {
          this.transactions = data;
          this.filteredTransactions = [...this.transactions];
          this.isLoading = false;
          
          // Close loading and show success
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `${data.length} transaction(s) loaded successfully.`,
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#00897b'
          });
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.isLoading = false;
          
          // Show error message
          Swal.fire({
            icon: 'error',
            title: 'Loading Failed',
            text: 'Unable to load transactions. Please try again.',
            confirmButtonText: 'Retry',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#00897b',
            cancelButtonColor: '#d33'
          }).then((result) => {
            if (result.isConfirmed) {
              this.loadTransactions();
            }
          });
        }
      });
    } else {
      this.isLoading = false;
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'Please log in to view your transactions.',
        confirmButtonColor: '#00897b'
      });
    }
  }
  
  async selectTransaction(transaction: Transaction): Promise<void> {
    this.selectedTransaction = transaction;
    
    // Show loading for device details
    Swal.fire({
      title: 'Loading Transaction Details',
      text: 'Fetching complete transaction information...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let device: Device | null = null;

    if (transaction.device_id) {
      try {
        const devices = await this.userService.getUserDevices(transaction.device_id).toPromise();
        if (devices && devices.length > 0) {
          device = devices[0];
        }
      } catch (error) {
        console.error('Error loading device details:', error);
      }
    }

    // Show transaction details in SweetAlert
    this.showTransactionDetails(transaction, device);
  }

  private showTransactionDetails(transaction: Transaction, device: Device | null): void {
    const statusBadge = this.getStatusBadge(transaction.status);
    
    const deviceInfo = device ? `
      <div class="detail-section">
        <h4>Device Information</h4>
        <p><strong>Device Name:</strong> ${device.device_name || 'N/A'}</p>
        <!-- Device Type and Location not available in Device interface -->
      </div>
    ` : '';

    Swal.fire({
      title: 'Transaction Details',
      html: `
        <div class="transaction-details-modal">
          <div class="detail-section">
            <h4>Transaction Information</h4>
            <p><strong>Reference:</strong> ${transaction.transaction_reference}</p>
            <p><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleString()}</p>
            <p><strong>Amount:</strong> TSh ${transaction.amount.toLocaleString()}</p>
            <p><strong>Units:</strong> ${transaction.units_purchased} kWh</p>
            <p><strong>Payment Method:</strong> ${transaction.payment_method}</p>
            <p><strong>Status:</strong> ${statusBadge}</p>
          </div>
          
          <div class="detail-section">
            <h4>Balance Information</h4>
            <p><strong>Balance Before:</strong> TSh ${transaction.balance_before.toLocaleString()}</p>
            <p><strong>Balance After:</strong> TSh ${transaction.balance_after.toLocaleString()}</p>
          </div>

          ${deviceInfo}
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: '📄 Download Receipt',
      cancelButtonText: 'Close',
      confirmButtonColor: '#00897b',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'transaction-details-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.downloadReceipt(transaction);
      }
    });
  }

  private getStatusBadge(status: string): string {
    const badges = {
      'Completed': '<span class="status-badge success">✅ Completed</span>',
      'Pending': '<span class="status-badge warning">⏳ Pending</span>',
      'Failed': '<span class="status-badge error">❌ Failed</span>'
    };
    return badges[status as keyof typeof badges] || `<span class="status-badge">${status}</span>`;
  }

  filterTransactions(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesSearch = 
        transaction.id.toString().toLowerCase().includes(this.searchText.toLowerCase()) || 
        transaction.transaction_reference.toLowerCase().includes(this.searchText.toLowerCase()) ||
        transaction.amount.toString().toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || transaction.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.filterTransactions();
  }

  downloadReceipt(transaction: Transaction): void {
    // Show loading for receipt generation
    Swal.fire({
      title: 'Generating Receipt',
      text: 'Please wait while we prepare your receipt...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Simulate receipt generation (replace with actual API call)
    setTimeout(() => {
      this.generateAndDownloadReceipt(transaction);
    }, 2000);
  }

  private generateAndDownloadReceipt(transaction: Transaction): void {
    try {
      // Generate receipt content
      const receiptContent = this.generateReceiptContent(transaction);
      
      // Create and download the receipt
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${transaction.transaction_reference}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Receipt Downloaded!',
        text: `Receipt for transaction ${transaction.transaction_reference} has been downloaded.`,
        confirmButtonColor: '#00897b'
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Unable to generate receipt. Please try again.',
        confirmButtonColor: '#d33'
      });
    }
  }

  private generateReceiptContent(transaction: Transaction): string {
    const currentDate = new Date().toLocaleString();
    
    return `
===============================================
           ELECTRICITY PURCHASE RECEIPT
===============================================

Transaction Reference: ${transaction.transaction_reference}
Transaction Date: ${new Date(transaction.created_at).toLocaleString()}
Receipt Generated: ${currentDate}

-----------------------------------------------
TRANSACTION DETAILS
-----------------------------------------------
Amount Paid: TSh ${transaction.amount.toLocaleString()}
Units Purchased: ${transaction.units_purchased} kWh
Payment Method: ${transaction.payment_method}
Status: ${transaction.status}

-----------------------------------------------
BALANCE INFORMATION
-----------------------------------------------
Balance Before: TSh ${transaction.balance_before.toLocaleString()}
Balance After: TSh ${transaction.balance_after.toLocaleString()}

-----------------------------------------------
DEVICE INFORMATION
-----------------------------------------------
Device ID: ${transaction.device_id}

-----------------------------------------------
IMPORTANT NOTES
-----------------------------------------------
- Keep this receipt for your records
- Contact support if you have any questions
- Transaction ID: ${transaction.id}

===============================================
Thank you for using our electricity service!
===============================================
`;
  }

  refreshTransactions(): void {
    this.loadTransactions();
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Completed': '✅',
      'Pending': '⏳',
      'Failed': '❌'
    };
    return icons[status] || '⚪';
  }

  getCompletedCount(): number {
    return this.transactions.filter(t => t.status === 'Completed').length;
  }

  getPendingCount(): number {
    return this.transactions.filter(t => t.status === 'Pending').length;
  }

  getTotalAmount(): number {
    return this.transactions
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
