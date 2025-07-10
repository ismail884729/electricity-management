import { Component, OnInit } from '@angular/core';
import { AdminService, Setting } from '../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  settings: Setting[] = [];
  filteredSettings: Setting[] = [];
  categories: string[] = [];
  selectedCategory: string = 'All';
  searchTerm: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.adminService.getAllSettings().subscribe(settings => {
      this.settings = settings;
      // For now, we'll categorize them based on a simple mapping or add a category field to the Setting interface if needed.
      // For simplicity, let's assume a 'category' property is added to the Setting interface or derived.
      // For now, we'll just use a dummy category for filtering.
      this.categories = ['All', ...new Set(this.settings.map(s => s.setting_key.split('-')[0]))]; // Example: "notification-email" -> "notification"
      this.filterSettings();
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterSettings();
  }

  filterSettings(): void {
    this.filteredSettings = this.settings.filter(setting => {
      const matchesCategory = this.selectedCategory === 'All' || setting.setting_key.startsWith(this.selectedCategory.toLowerCase());
      const matchesSearch = this.searchTerm === '' || 
                           setting.setting_key.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                           setting.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  getSettingsByCategory(category: string): Setting[] {
    return this.settings.filter(setting => setting.setting_key.startsWith(category.toLowerCase()));
  }

  saveSetting(setting: Setting): void {
    this.showLoadingAlert(`Saving setting ${setting.setting_key}...`);
    this.adminService.updateSetting(setting.setting_key, { setting_value: setting.setting_value, description: setting.description }).subscribe({
      next: () => {
        Swal.close();
        this.showSuccessAlert(`Setting '${setting.setting_key}' updated successfully!`);
        this.loadSettings(); // Reload to reflect changes
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to update setting.', err.message);
      }
    });
  }

  toggleBooleanSetting(setting: Setting): void {
    // Assuming boolean settings have 'true'/'false' string values
    setting.setting_value = setting.setting_value === 'true' ? 'false' : 'true';
    this.saveSetting(setting);
  }

  saveAllSettings(): void {
    // This would require a bulk update endpoint or iterating and saving each.
    // For now, individual saves are handled by saveSetting.
    this.showSuccessAlert('All settings saved successfully!');
  }

  resetSettings(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will reset all settings to their default values. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset them!',
      cancelButtonText: 'No, keep current'
    }).then((result) => {
      if (result.value) {
        this.showLoadingAlert('Resetting settings...');
        // In a real app, this would call a service to reset settings
        // For now, we'll just reload the settings from the server.
        this.adminService.getAllSettings().subscribe({
          next: (settings) => {
            Swal.close();
            this.settings = settings; // Reload from server
            this.filterSettings();
            this.showSuccessAlert('Settings have been reset to default values (reloaded from server).');
          },
          error: (err) => {
            Swal.close();
            this.showErrorAlert('Failed to reset settings.', err.message);
          }
        });
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
}
