import { Component, OnInit } from '@angular/core';

interface SystemSetting {
  id: string;
  name: string;
  value: string | boolean | number;
  type: 'text' | 'number' | 'boolean' | 'select';
  category: string;
  description: string;
  options?: string[];
}

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  settings: SystemSetting[] = [];
  filteredSettings: SystemSetting[] = [];
  categories: string[] = [];
  selectedCategory: string = 'All';
  searchTerm: string = '';

  constructor() {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // In a real app, this would come from a service
    this.settings = [
      {
        id: 'notification-email',
        name: 'Notification Email',
        value: 'admin@electricitysystem.com',
        type: 'text',
        category: 'Notifications',
        description: 'Email address for system notifications'
      },
      {
        id: 'notification-alerts',
        name: 'System Alerts',
        value: true,
        type: 'boolean',
        category: 'Notifications',
        description: 'Send email alerts for critical system events'
      },
      {
        id: 'billing-cycle',
        name: 'Billing Cycle Day',
        value: 15,
        type: 'number',
        category: 'Billing',
        description: 'Day of the month when billing cycle ends'
      },
      {
        id: 'payment-grace-period',
        name: 'Payment Grace Period',
        value: 10,
        type: 'number',
        category: 'Billing',
        description: 'Number of days after due date before late fees apply'
      },
      {
        id: 'late-fee-percentage',
        name: 'Late Fee Percentage',
        value: 2.5,
        type: 'number',
        category: 'Billing',
        description: 'Percentage charged for late payments'
      },
      {
        id: 'system-theme',
        name: 'System Theme',
        value: 'Light',
        type: 'select',
        category: 'Appearance',
        description: 'Default theme for the admin interface',
        options: ['Light', 'Dark', 'System Default']
      },
      {
        id: 'dashboard-refresh',
        name: 'Dashboard Refresh Rate',
        value: '5 minutes',
        type: 'select',
        category: 'System',
        description: 'How often the dashboard data refreshes',
        options: ['1 minute', '5 minutes', '15 minutes', '30 minutes', '1 hour']
      },
      {
        id: 'maintenance-mode',
        name: 'Maintenance Mode',
        value: false,
        type: 'boolean',
        category: 'System',
        description: 'Put the system in maintenance mode (users will see a maintenance page)'
      },
      {
        id: 'data-backup',
        name: 'Automatic Backups',
        value: true,
        type: 'boolean',
        category: 'Security',
        description: 'Enable automatic daily database backups'
      },
      {
        id: 'session-timeout',
        name: 'Session Timeout',
        value: 30,
        type: 'number',
        category: 'Security',
        description: 'Inactivity period (minutes) before session expires'
      }
    ];

    // Extract unique categories
    this.categories = ['All', ...new Set(this.settings.map(s => s.category))];
    
    // Initialize filtered settings
    this.filterSettings();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterSettings();
  }

  filterSettings(): void {
    this.filteredSettings = this.settings.filter(setting => {
      const matchesCategory = this.selectedCategory === 'All' || setting.category === this.selectedCategory;
      const matchesSearch = this.searchTerm === '' || 
                           setting.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           setting.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getSettingsByCategory(category: string): SystemSetting[] {
    return this.settings.filter(setting => setting.category === category);
  }

  saveSetting(setting: SystemSetting): void {
    console.log(`Saving setting ${setting.id}:`, setting.value);
    // In a real app, this would call a service to update the setting
  }

  toggleBooleanSetting(setting: SystemSetting): void {
    setting.value = !setting.value;
    this.saveSetting(setting);
  }

  saveAllSettings(): void {
    console.log('Saving all settings:', this.settings);
    // In a real app, this would call a service to update all settings
    alert('All settings saved successfully!');
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      console.log('Resetting settings to defaults');
      // In a real app, this would call a service to reset settings
      this.loadSettings();
      alert('Settings have been reset to default values.');
    }
  }
}
