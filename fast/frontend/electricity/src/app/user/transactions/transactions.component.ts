import { Component, OnInit } from '@angular/core';

interface Transaction {
  id: string;
  date: string;
  amount: string;
  units: string;
  status: string;
  paymentMethod: string;
  receiptNo: string;
}

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
  
  constructor() { }

  ngOnInit(): void {
    // Mock transaction data
    this.transactions = [
      {
        id: 'TXN-001',
        date: '2023-11-10',
        amount: '$25.00',
        units: '120 kWh',
        status: 'Completed',
        paymentMethod: 'Credit Card',
        receiptNo: 'R-10920'
      },
      {
        id: 'TXN-002',
        date: '2023-10-25',
        amount: '$15.50',
        units: '75 kWh',
        status: 'Completed',
        paymentMethod: 'PayPal',
        receiptNo: 'R-10845'
      },
      {
        id: 'TXN-003',
        date: '2023-10-15',
        amount: '$30.00',
        units: '150 kWh',
        status: 'Completed',
        paymentMethod: 'Bank Transfer',
        receiptNo: 'R-10792'
      },
      {
        id: 'TXN-004',
        date: '2023-10-05',
        amount: '$10.00',
        units: '50 kWh',
        status: 'Pending',
        paymentMethod: 'Credit Card',
        receiptNo: 'R-10756'
      },
      {
        id: 'TXN-005',
        date: '2023-09-20',
        amount: '$20.00',
        units: '100 kWh',
        status: 'Failed',
        paymentMethod: 'PayPal',
        receiptNo: 'R-10701'
      },
      {
        id: 'TXN-006',
        date: '2023-09-10',
        amount: '$22.50',
        units: '110 kWh',
        status: 'Completed',
        paymentMethod: 'Bank Transfer',
        receiptNo: 'R-10642'
      }
    ];
    
    this.filteredTransactions = [...this.transactions];
  }
  
  selectTransaction(transaction: Transaction): void {
    this.selectedTransaction = transaction;
  }

  filterTransactions(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      const matchesSearch = transaction.id.toLowerCase().includes(this.searchText.toLowerCase()) || 
                           transaction.date.includes(this.searchText) || 
                           transaction.amount.toLowerCase().includes(this.searchText.toLowerCase()) ||
                           transaction.receiptNo.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || transaction.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.filterTransactions();
  }

  downloadReceipt(receiptNo: string): void {
    // In a real implementation, this would download a receipt or invoice
    alert(`Downloading receipt ${receiptNo}`);
  }
}
