import { Component, OnInit } from '@angular/core';

interface RefundDetails {
  date: string;
  amount: number;
  reason: string;
  processedBy: string;
}

interface Transaction {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  amount: number;
  kwhPurchased: number;
  ratePlan: string;
  ratePerKwh: number;
  paymentMethod: string;
  paymentId: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  meterId: string;
  notes?: string;
  refundDetails?: RefundDetails;
}

@Component({
  selector: 'app-admin-transactions',
  templateUrl: './admin-transactions.component.html',
  styleUrls: ['./admin-transactions.component.css']
})
export class AdminTransactionsComponent implements OnInit {
  // Transactions data
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  
  // Search and filter
  searchTerm: string = '';
  statusFilter: string = 'all';
  paymentMethodFilter: string = 'all';
  startDate: string = '';
  endDate: string = '';
  minAmount: number | null = null;
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  
  // Modal
  showTransactionModal: boolean = false;
  modalTitle: string = '';
  selectedTransaction: Transaction | null = null;
  
  // Refund form
  showRefundForm: boolean = false;
  refundReason: string = '';
  refundAmount: number = 0;
  refundNotes: string = '';

  constructor() { }

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.loadTransactions();
  }

  setDefaultDateRange(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.endDate = this.formatDate(today);
    this.startDate = this.formatDate(thirtyDaysAgo);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadTransactions(): void {
    // In a real application, this would come from a service
    this.transactions = [
      {
        id: 'TRX-00123',
        timestamp: '2023-07-06 14:35:22',
        user: 'John Smith',
        userId: 'USR-001',
        amount: 125.50,
        kwhPurchased: 875,
        ratePlan: 'Residential Standard',
        ratePerKwh: 0.1435,
        paymentMethod: 'Direct Transfer',
        paymentId: 'PAY-9876543',
        status: 'completed',
        meterId: 'DEV-001'
      },
      {
        id: 'TRX-00122',
        timestamp: '2023-07-06 12:15:08',
        user: 'Jane Doe',
        userId: 'USR-002',
        amount: 78.25,
        kwhPurchased: 547,
        ratePlan: 'Residential Time-of-Use',
        ratePerKwh: 0.1430,
        paymentMethod: 'Direct Transfer',
        paymentId: 'PAY-9876542',
        status: 'completed',
        meterId: 'DEV-002'
      },
      {
        id: 'TRX-00121',
        timestamp: '2023-07-06 09:44:17',
        user: 'Robert Johnson',
        userId: 'USR-003',
        amount: 324.75,
        kwhPurchased: 1850,
        ratePlan: 'Business Standard',
        ratePerKwh: 0.1755,
        paymentMethod: 'Direct Transfer',
        paymentId: 'PAY-9876541',
        status: 'completed',
        meterId: 'DEV-003'
      },
      {
        id: 'TRX-00120',
        timestamp: '2023-07-05 16:22:01',
        user: 'Sarah Williams',
        userId: 'USR-004',
        amount: 45.60,
        kwhPurchased: 320,
        ratePlan: 'Residential Standard',
        ratePerKwh: 0.1425,
        paymentMethod: 'Direct Transfer',
        paymentId: 'PAY-9876540',
        status: 'pending',
        meterId: 'DEV-004'
      },
      {
        id: 'TRX-00119',
        timestamp: '2023-07-05 14:09:33',
        user: 'Michael Brown',
        userId: 'USR-005',
        amount: 212.30,
        kwhPurchased: 1450,
        ratePlan: 'Residential Standard',
        ratePerKwh: 0.1464,
        paymentMethod: 'Direct Transfer',
        paymentId: 'PAY-9876539',
        status: 'failed',
        meterId: 'DEV-005',
        notes: 'Payment processor declined the transaction.'
      },
      {
        id: 'TRX-00118',
        timestamp: '2023-07-05 10:55:19',
        user: 'Emily Davis',
        userId: 'USR-006',
        amount: 95.40,
        kwhPurchased: 680,
        ratePlan: 'Residential Green Energy',
        ratePerKwh: 0.1403,
        paymentMethod: 'Direct Transfer',
        paymentId: 'PAY-9876538',
        status: 'refunded',
        meterId: 'DEV-006',
        refundDetails: {
          date: '2023-07-05 15:30:45',
          amount: 95.40,
          reason: 'Customer Request',
          processedBy: 'Admin User'
        }
      }
    ];
    
    this.applyFilters();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  searchTransactions(): void {
    this.applyFilters();
  }

  filterTransactions(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.transactions];
    
    // Apply search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.user.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === this.statusFilter);
    }
    
    // Apply payment method filter
    if (this.paymentMethodFilter !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.paymentMethod === 'Direct Transfer'
      );
    }
    
    // Apply date range filter
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59); // Include the entire end day
      
      filtered = filtered.filter(transaction => {
        const txDate = new Date(transaction.timestamp);
        return txDate >= start && txDate <= end;
      });
    }
    
    // Apply minimum amount filter
    if (this.minAmount !== null) {
      filtered = filtered.filter(transaction => transaction.amount >= this.minAmount!);
    }
    
    this.filteredTransactions = filtered;
    this.calculatePagination();
    this.currentPage = 1; // Reset to first page
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.paymentMethodFilter = 'all';
    this.setDefaultDateRange();
    this.minAmount = null;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewTransactionDetails(transaction: Transaction): void {
    this.selectedTransaction = {...transaction};
    this.modalTitle = 'Transaction Details';
    this.showTransactionModal = true;
    this.showRefundForm = false;
  }

  generateReceipt(transaction: Transaction): void {
    // In a real app, this would generate a PDF receipt or similar
    alert(`Receipt for transaction ${transaction.id} will be generated and downloaded shortly.`);
  }

  initiateRefund(transaction: Transaction): void {
    this.selectedTransaction = {...transaction};
    this.refundAmount = transaction.amount;
    this.refundReason = 'customer_request';
    this.refundNotes = '';
    this.showRefundForm = true;
  }

  processRefund(): void {
    if (!this.selectedTransaction) return;
    
    // In a real app, this would call a service to process the refund
    const now = new Date();
    const refundDetails: RefundDetails = {
      date: now.toISOString().replace('T', ' ').substring(0, 19),
      amount: this.refundAmount,
      reason: this.refundReason,
      processedBy: 'Admin User'
    };
    
    // Update the transaction
    const index = this.transactions.findIndex(t => t.id === this.selectedTransaction!.id);
    if (index !== -1) {
      this.transactions[index].status = 'refunded';
      this.transactions[index].refundDetails = refundDetails;
      this.transactions[index].notes = this.refundNotes ? 
        (this.transactions[index].notes ? 
          `${this.transactions[index].notes}. Refund notes: ${this.refundNotes}` : 
          `Refund notes: ${this.refundNotes}`) : 
        this.transactions[index].notes;
      
      // Update the selected transaction
      this.selectedTransaction = {...this.transactions[index]};
    }
    
    this.showRefundForm = false;
    this.applyFilters();
    alert(`Refund for transaction ${this.selectedTransaction.id} has been processed successfully.`);
  }

  cancelRefund(): void {
    this.showRefundForm = false;
  }

  closeModal(): void {
    this.showTransactionModal = false;
    this.showRefundForm = false;
    this.selectedTransaction = null;
  }
}
