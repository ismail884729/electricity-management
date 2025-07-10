import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Transaction } from '../../services/user.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Explicitly import autoTable

@Component({
  selector: 'app-admin-transactions',
  templateUrl: './admin-transactions.component.html',
  styleUrls: ['./admin-transactions.component.css']
})
export class AdminTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  paymentMethodFilter: string = 'all';
  startDate: string = '';
  endDate: string = '';

  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;

  // Modal
  showTransactionModal: boolean = false;
  selectedTransaction: Transaction | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.showLoadingAlert('Loading Transactions...');
    const params: any = {
      skip: (this.currentPage - 1) * this.pageSize,
      limit: this.pageSize
    };

    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }
    if (this.paymentMethodFilter !== 'all') {
      params.payment_method = this.paymentMethodFilter;
    }
    if (this.startDate) {
      params.start_date = this.startDate;
    }
    if (this.endDate) {
      params.end_date = this.endDate;
    }

    this.adminService.getAllTransactions(params).subscribe({
      next: (transactions) => {
        Swal.close();
        this.transactions = transactions;
        this.filteredTransactions = transactions; // Assuming API returns already filtered/paginated data
        this.calculatePagination();
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to load transactions.', err.message);
      }
    });
  }

  applyFilters(): void {
    // With backend filtering, this method will just trigger a reload of transactions
    this.loadTransactions();
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

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.paymentMethodFilter = 'all';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewTransactionDetails(transaction: Transaction): void {
    this.selectedTransaction = { ...transaction };
    this.showTransactionModal = true;
  }

  closeModal(): void {
    this.showTransactionModal = false;
    this.selectedTransaction = null;
  }

  displayTransactionsSummary(): void {
    this.showLoadingAlert('Loading Summary...');
    const params: any = {};
    if (this.startDate) {
      params.start_date = this.startDate;
    }
    if (this.endDate) {
      params.end_date = this.endDate;
    }

    this.adminService.getTransactionsSummary(params).subscribe({
      next: (summary) => {
        Swal.close();
        this.showSummaryInSweetAlert(summary);
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to get transaction summary.', err.message);
      }
    });
  }

  generateTransactionsPdf(): void {
    this.showLoadingAlert('Generating PDF Summary...');
    const params: any = {};
    if (this.startDate) {
      params.start_date = this.startDate;
    }
    if (this.endDate) {
      params.end_date = this.endDate;
    }

    this.adminService.getTransactionsSummary(params).subscribe({
      next: (summary) => {
        Swal.close();
        this.generatePdfSummary(summary);
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to generate PDF summary.', err.message);
      }
    });
  }

  exportTransactions(): void {
    this.showLoadingAlert('Exporting Transactions...');
    const params: any = {};
    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }
    if (this.paymentMethodFilter !== 'all') {
      params.payment_method = this.paymentMethodFilter;
    }
    if (this.startDate) {
      params.start_date = this.startDate;
    }
    if (this.endDate) {
      params.end_date = this.endDate;
    }

    this.adminService.exportTransactionsCsv(params).subscribe({
      next: (data) => {
        Swal.close();
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showSuccessAlert('Transactions exported successfully!');
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to export transactions.', err.message);
      }
    });
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

  private generatePdfSummary(summary: any): void {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Transaction Summary Report', 14, 22);

    // Date Range
    doc.setFontSize(10);
    const startDate = this.startDate || 'All Time';
    const endDate = this.endDate || 'Present';
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);

    // Summary Details
    let yPos = 40;
    doc.setFontSize(12);
    doc.text(`Total Transactions: ${summary.total_transactions}`, 14, yPos);
    yPos += 7;
    doc.text(`Total Amount: TSh ${(summary.total_amount || 0).toLocaleString()}`, 14, yPos);
    yPos += 7;
    doc.text(`Total Units: ${(summary.total_units || 0).toLocaleString()} kWh`, 14, yPos);
    yPos += 7;
    doc.text(`Average Transaction Amount: TSh ${(summary.average_transaction_amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 14, yPos);
    yPos += 10;

    // Payment Methods Summary
    if (summary.payment_methods && Object.keys(summary.payment_methods).length > 0) {
      doc.setFontSize(14);
      doc.text('Payment Methods Breakdown', 14, yPos);
      yPos += 8;

      const paymentMethodData = Object.keys(summary.payment_methods).map(method => {
        const methodSummary = summary.payment_methods[method];
        return [
          method,
          `TSh ${(methodSummary.total_amount || 0).toLocaleString()}`,
          `${(methodSummary.total_transactions || 0)} transactions`
        ];
      });

      autoTable(doc, { // Call autoTable directly with doc as the first argument
        startY: yPos,
        head: [['Method', 'Total Amount', 'Transactions']],
        body: paymentMethodData,
        theme: 'striped',
        headStyles: { fillColor: [26, 35, 126] }, // Dark blue
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: 14, right: 14 }
      });
      // Increment yPos by a fixed amount after the table
      yPos += 50; // Adjust this value as needed for spacing
    } else {
      // If no payment methods, just increment yPos to leave space
      yPos += 20;
    }

    // Status Breakdown
    if (summary.status_breakdown && Object.keys(summary.status_breakdown).length > 0) {
      doc.setFontSize(14);
      doc.text('Transaction Status Breakdown', 14, yPos);
      yPos += 8;

      const statusData = Object.keys(summary.status_breakdown).map(status => {
        const statusSummary = summary.status_breakdown[status];
        return [
          status,
          `${(statusSummary.count || 0)} transactions`,
          `TSh ${(statusSummary.total_amount || 0).toLocaleString()}`
        ];
      });

      autoTable(doc, { // Call autoTable directly with doc as the first argument
        startY: yPos,
        head: [['Status', 'Count', 'Total Amount']],
        body: statusData,
        theme: 'striped',
        headStyles: { fillColor: [0, 137, 123] }, // Teal
        styles: { fontSize: 10, cellPadding: 3 },
        margin: { left: 14, right: 14 }
      });
      // Increment yPos by a fixed amount after the table
      yPos += 50; // Adjust this value as needed for spacing
    } else {
      // If no status breakdown, just increment yPos to leave space
      yPos += 20;
    }

    // Save the PDF
    doc.save('transaction_summary.pdf');
    this.showSuccessAlert('Transaction summary PDF generated successfully!');
  }

  private showSummaryInSweetAlert(summary: any): void {
    let htmlContent = `
      <div class="transaction-summary-modal">
        <h4>Summary Period: ${this.startDate || 'All Time'} to ${this.endDate || 'Present'}</h4>
        <p><strong>Total Transactions:</strong> ${summary.total_transactions}</p>
        <p><strong>Total Amount:</strong> TSh ${(summary.total_amount || 0).toLocaleString()}</p>
        <p><strong>Total Units:</strong> ${(summary.total_units || 0).toLocaleString()} kWh</p>
        <p><strong>Average Transaction Amount:</strong> TSh ${(summary.average_transaction_amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
    `;

    if (summary.payment_methods && Object.keys(summary.payment_methods).length > 0) {
      htmlContent += `
        <h5>Payment Methods Breakdown:</h5>
        <ul>
      `;
      for (const method in summary.payment_methods) {
        const methodSummary = summary.payment_methods[method];
        htmlContent += `<li><strong>${method}:</strong> TSh ${(methodSummary.total_amount || 0).toLocaleString()} (${(methodSummary.total_transactions || 0)} transactions)</li>`;
      }
      htmlContent += `</ul>`;
    }

    if (summary.status_breakdown && Object.keys(summary.status_breakdown).length > 0) {
      htmlContent += `
        <h5>Transaction Status Breakdown:</h5>
        <ul>
      `;
      for (const status in summary.status_breakdown) {
        const statusSummary = summary.status_breakdown[status];
        htmlContent += `<li><strong>${status}:</strong> ${(statusSummary.count || 0)} transactions (TSh ${(statusSummary.total_amount || 0).toLocaleString()})</li>`;
      }
      htmlContent += `</ul>`;
    }

    htmlContent += `</div>`;

    Swal.fire({
      title: 'Transaction Summary',
      html: htmlContent,
      width: '600px',
      confirmButtonText: 'Close',
      confirmButtonColor: '#00897b',
      customClass: {
        popup: 'transaction-summary-popup'
      }
    });
  }
}
