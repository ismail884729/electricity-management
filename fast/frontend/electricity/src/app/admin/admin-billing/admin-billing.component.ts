import { Component, OnInit } from '@angular/core';

interface Bill {
  id: string;
  userId: string;
  userName: string;
  billNumber: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: string;
  unitsConsumed: number;
  period: string;
}

@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.css']
})
export class AdminBillingComponent implements OnInit {
  bills: Bill[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  selectedStatus: string = '';
  totalAmount: number = 0;
  paidAmount: number = 0;
  pendingAmount: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadBills();
    this.calculateTotals();
  }

  loadBills(): void {
    // Mock data - in real app, this would come from a service
    this.bills = [
      {
        id: 'BILL-001',
        userId: 'USR-001',
        userName: 'John Doe',
        billNumber: 'EL-2024-001',
        amount: 150.50,
        dueDate: '2024-02-15',
        issueDate: '2024-01-15',
        status: 'Paid',
        unitsConsumed: 350,
        period: 'Jan 2024'
      },
      {
        id: 'BILL-002',
        userId: 'USR-002',
        userName: 'Jane Smith',
        billNumber: 'EL-2024-002',
        amount: 89.25,
        dueDate: '2024-02-20',
        issueDate: '2024-01-20',
        status: 'Pending',
        unitsConsumed: 205,
        period: 'Jan 2024'
      },
      {
        id: 'BILL-003',
        userId: 'USR-003',
        userName: 'Bob Johnson',
        billNumber: 'EL-2024-003',
        amount: 275.75,
        dueDate: '2024-01-25',
        issueDate: '2023-12-25',
        status: 'Overdue',
        unitsConsumed: 620,
        period: 'Dec 2023'
      }
    ];
    
    this.totalPages = Math.ceil(this.bills.length / 10);
  }

  calculateTotals(): void {
    this.totalAmount = this.bills.reduce((sum, bill) => sum + bill.amount, 0);
    this.paidAmount = this.bills.filter(bill => bill.status === 'Paid').reduce((sum, bill) => sum + bill.amount, 0);
    this.pendingAmount = this.bills.filter(bill => bill.status !== 'Paid').reduce((sum, bill) => sum + bill.amount, 0);
  }

  searchBills(): void {
    console.log('Searching bills:', this.searchTerm);
    // In a real app, this would filter the bills
  }

  filterByStatus(): void {
    console.log('Filtering by status:', this.selectedStatus);
    // In a real app, this would filter bills by status
  }

  viewBillDetails(bill: Bill): void {
    console.log('Viewing bill details:', bill.id);
    // In a real app, this would show detailed bill information
  }

  editBill(bill: Bill): void {
    console.log('Editing bill:', bill.id);
    // In a real app, this would open an edit modal or navigate to edit page
  }

  sendReminder(bill: Bill): void {
    console.log('Sending reminder for bill:', bill.id);
    // In a real app, this would send a payment reminder
  }

  goToPage(page: number): void {
    this.currentPage = page;
    console.log('Going to page:', page);
    // In a real app, this would load the new page of bills
  }
}
