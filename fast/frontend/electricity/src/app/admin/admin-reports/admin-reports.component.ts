import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  selectedReportType: string = 'consumption';
  selectedTimePeriod: string = 'monthly';
  startDate: string = '';
  endDate: string = '';
  reportGenerated: boolean = false;

  constructor() {}

  ngOnInit(): void {
    // Set default date range to last month
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    this.endDate = this.formatDate(now);
    this.startDate = this.formatDate(lastMonth);
  }

  generateReport(): void {
    // In a real app, this would fetch report data from a service
    console.log('Generating report:', {
      type: this.selectedReportType,
      period: this.selectedTimePeriod,
      startDate: this.startDate,
      endDate: this.endDate
    });
    this.reportGenerated = true;
  }

  exportReport(): void {
    if (!this.reportGenerated) {
      alert('Please generate a report first.');
      return;
    }
    
    // In a real app, this would export the report data to CSV/PDF
    console.log('Exporting report...');
    alert('Report export initiated. The file will be downloaded shortly.');
  }

  getReportTitle(): string {
    const type = this.capitalizeFirstLetter(this.selectedReportType);
    let period = '';
    
    switch (this.selectedTimePeriod) {
      case 'daily':
        period = 'Daily';
        break;
      case 'weekly':
        period = 'Weekly';
        break;
      case 'monthly':
        period = 'Monthly';
        break;
      case 'quarterly':
        period = 'Quarterly';
        break;
      case 'yearly':
        period = 'Yearly';
        break;
      case 'custom':
        period = `${this.formatDateForDisplay(this.startDate)} to ${this.formatDateForDisplay(this.endDate)}`;
        break;
    }
    
    return `${type} Report - ${period}`;
  }

  getSummaryValue(index: number): string {
    switch (this.selectedReportType) {
      case 'consumption':
        return index === 1 ? '1,234 kWh' : index === 2 ? '+5.2%' : '98.7%';
      case 'revenue':
        return index === 1 ? '$45,678' : index === 2 ? '+3.7%' : '$37.01';
      case 'users':
        return index === 1 ? '5,678' : index === 2 ? '+12.3%' : '94%';
      case 'devices':
        return index === 1 ? '8,901' : index === 2 ? '+7.8%' : '1.57';
      case 'outages':
        return index === 1 ? '7' : index === 2 ? '-23.4%' : '99.98%';
      default:
        return 'N/A';
    }
  }

  getSummaryLabel(index: number): string {
    switch (this.selectedReportType) {
      case 'consumption':
        return index === 1 ? 'Total Consumption' : index === 2 ? 'YoY Change' : 'Accuracy Rate';
      case 'revenue':
        return index === 1 ? 'Total Revenue' : index === 2 ? 'YoY Change' : 'Avg Revenue Per User';
      case 'users':
        return index === 1 ? 'Total Users' : index === 2 ? 'YoY Change' : 'Retention Rate';
      case 'devices':
        return index === 1 ? 'Total Devices' : index === 2 ? 'YoY Change' : 'Devices Per User';
      case 'outages':
        return index === 1 ? 'Total Outages' : index === 2 ? 'YoY Change' : 'Uptime Percentage';
      default:
        return 'N/A';
    }
  }

  getChartTitle(): string {
    switch (this.selectedReportType) {
      case 'consumption':
        return 'Energy Consumption Over Time';
      case 'revenue':
        return 'Revenue Breakdown';
      case 'users':
        return 'User Growth';
      case 'devices':
        return 'Device Distribution';
      case 'outages':
        return 'System Outages';
      default:
        return 'Report Data';
    }
  }

  getMockChartData(): number[] {
    // Generate mock data for visualization
    return [45, 65, 55, 80, 70, 75];
  }

  getMockChartLabels(): string[] {
    // Generate mock labels for the chart
    if (this.selectedTimePeriod === 'monthly') {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    } else if (this.selectedTimePeriod === 'daily') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    } else {
      return ['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2'];
    }
  }

  getTableHeaders(): string[] {
    switch (this.selectedReportType) {
      case 'consumption':
        return ['Date', 'Total kWh', 'Peak Usage', 'Off-Peak Usage', 'Change'];
      case 'revenue':
        return ['Date', 'Total Revenue', 'Paid', 'Pending', 'Overdue'];
      case 'users':
        return ['Date', 'Total Users', 'New Users', 'Active Users', 'Inactive Users'];
      case 'devices':
        return ['Device Type', 'Count', 'Active', 'Inactive', 'Avg Usage'];
      case 'outages':
        return ['Date', 'Duration', 'Affected Users', 'Cause', 'Resolution Time'];
      default:
        return ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5'];
    }
  }

  getTableData(): any[][] {
    // Generate mock table data
    const data: any[][] = [];
    const rows = 5;
    
    for (let i = 0; i < rows; i++) {
      switch (this.selectedReportType) {
        case 'consumption':
          data.push([
            `2023-06-${String(i + 1).padStart(2, '0')}`,
            `${1000 + Math.floor(Math.random() * 500)} kWh`,
            `${500 + Math.floor(Math.random() * 200)} kWh`,
            `${300 + Math.floor(Math.random() * 200)} kWh`,
            `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 10)}%`
          ]);
          break;
        case 'revenue':
          data.push([
            `2023-06-${String(i + 1).padStart(2, '0')}`,
            `$${8000 + Math.floor(Math.random() * 2000)}`,
            `$${6000 + Math.floor(Math.random() * 1500)}`,
            `$${1000 + Math.floor(Math.random() * 500)}`,
            `$${Math.floor(Math.random() * 300)}`
          ]);
          break;
        case 'users':
          data.push([
            `2023-06-${String(i + 1).padStart(2, '0')}`,
            5000 + i * 100 + Math.floor(Math.random() * 50),
            30 + Math.floor(Math.random() * 20),
            4500 + i * 80 + Math.floor(Math.random() * 40),
            200 + Math.floor(Math.random() * 30)
          ]);
          break;
        case 'devices':
          const deviceTypes = ['Smart Meter', 'Energy Monitor', 'Smart Thermostat', 'Smart Plug', 'Solar Inverter'];
          data.push([
            deviceTypes[i],
            2000 - i * 300 + Math.floor(Math.random() * 100),
            1800 - i * 300 + Math.floor(Math.random() * 80),
            200 - i * 20 + Math.floor(Math.random() * 30),
            `${5 + Math.floor(Math.random() * 5)} hrs/day`
          ]);
          break;
        case 'outages':
          data.push([
            `2023-06-${String(i + 1).padStart(2, '0')}`,
            `${Math.floor(Math.random() * 120)} mins`,
            Math.floor(Math.random() * 500),
            ['Equipment Failure', 'Weather', 'Scheduled Maintenance', 'Power Surge', 'Unknown'][i],
            `${Math.floor(Math.random() * 90)} mins`
          ]);
          break;
        default:
          data.push([
            `Row ${i + 1}, Col 1`,
            `Row ${i + 1}, Col 2`,
            `Row ${i + 1}, Col 3`,
            `Row ${i + 1}, Col 4`,
            `Row ${i + 1}, Col 5`
          ]);
      }
    }
    
    return data;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
