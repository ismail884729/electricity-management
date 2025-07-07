import { Component, OnInit } from '@angular/core';

interface Activity {
  time: string;
  user: string;
  action: string;
  details: string;
}

interface SystemStatus {
  name: string;
  description: string;
  status: 'operational' | 'warning' | 'critical';
  icon: string;
}

interface RevenueSegment {
  label: string;
  percentage: number;
  color: string;
  rotation: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Chart data
  consumptionData = [65, 59, 80, 81, 56, 55, 72];
  timeLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  revenueDistribution: RevenueSegment[] = [
    { label: 'Residential', percentage: 45, color: '#4e73df', rotation: 0 },
    { label: 'Commercial', percentage: 30, color: '#1cc88a', rotation: 162 },
    { label: 'Industrial', percentage: 15, color: '#36b9cc', rotation: 270 },
    { label: 'Other', percentage: 10, color: '#f6c23e', rotation: 324 }
  ];

  // Recent activities
  recentActivities: Activity[] = [
    {
      time: '2 minutes ago',
      user: 'John Doe',
      action: 'Payment',
      details: 'Made a payment of $125.50'
    },
    {
      time: '15 minutes ago',
      user: 'Jane Smith',
      action: 'Account Update',
      details: 'Updated contact information'
    },
    {
      time: '1 hour ago',
      user: 'Robert Johnson',
      action: 'New Registration',
      details: 'Created a new account'
    },
    {
      time: '3 hours ago',
      user: 'Emily Davis',
      action: 'Meter Reading',
      details: 'Submitted a meter reading of 1,234 kWh'
    },
    {
      time: '5 hours ago',
      user: 'Admin User',
      action: 'System Update',
      details: 'Updated rate plans'
    }
  ];

  // System statuses
  systemStatuses: SystemStatus[] = [
    {
      name: 'Payment Gateway',
      description: 'All payment systems operating normally',
      status: 'operational',
      icon: 'fa-credit-card'
    },
    {
      name: 'Metering System',
      description: 'Data collection operating at normal levels',
      status: 'operational',
      icon: 'fa-tachometer-alt'
    },
    {
      name: 'Customer Portal',
      description: 'Experiencing higher than normal traffic',
      status: 'warning',
      icon: 'fa-users'
    },
    {
      name: 'Reporting System',
      description: 'Scheduled maintenance in progress',
      status: 'warning',
      icon: 'fa-chart-bar'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // In a real application, this would fetch data from a service
  }

  updateDateRange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = target.value;
    // In a real application, this would update the dashboard data based on the selected range
    console.log('Selected date range:', selectedValue);
  }
}
