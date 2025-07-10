import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Device } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-devices',
  templateUrl: './admin-devices.component.html',
  styleUrls: ['./admin-devices.component.css']
})
export class AdminDevicesComponent implements OnInit {
  devices: Device[] = [];
  filteredDevices: Device[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';

  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;

  // Modal
  showDeviceModal: boolean = false;
  modalTitle: string = '';
  modalMode: 'view' | 'edit' | 'add' = 'view';
  selectedDevice: Device | null = null;
  newDevice: Partial<Device> = {};

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.showLoadingAlert('Loading Devices...');
    this.adminService.getAllDevices().subscribe({
      next: (devices) => {
        Swal.close();
        this.devices = devices;
        this.applyFilters();
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to load devices.', err.message);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.devices];

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(device =>
        device.device_id.toLowerCase().includes(searchLower) ||
        device.device_name.toLowerCase().includes(searchLower)
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(device => (device.is_online ? 'active' : 'inactive') === this.statusFilter);
    }

    this.filteredDevices = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDevices.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  searchDevices(): void {
    this.applyFilters();
  }

  filterDevices(): void {
    this.applyFilters();
  }

  refreshDevices(): void {
    this.loadDevices();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewDeviceDetails(device: Device): void {
    this.selectedDevice = { ...device };
    this.modalTitle = 'Device Details';
    this.modalMode = 'view';
    this.showDeviceModal = true;
  }

  editDevice(device: Device): void {
    this.selectedDevice = { ...device };
    this.modalTitle = 'Edit Device';
    this.modalMode = 'edit';
    this.showDeviceModal = true;
  }

  addDevice(): void {
    this.newDevice = {};
    this.modalTitle = 'Add New Device';
    this.modalMode = 'add';
    this.showDeviceModal = true;
  }

  saveDeviceChanges(): void {
    if (this.modalMode === 'edit' && this.selectedDevice) {
      this.showLoadingAlert('Updating Device...');
      this.adminService.updateDevice(this.selectedDevice.id, this.selectedDevice).subscribe({
        next: () => {
          Swal.close();
          this.showSuccessAlert('Device updated successfully!');
          this.loadDevices();
          this.closeModal();
        },
        error: (err) => {
          Swal.close();
          this.showErrorAlert('Failed to update device.', err.message);
        }
      });
    } else if (this.modalMode === 'add') {
      this.showLoadingAlert('Adding New Device...');
      // Using the new public endpoint for creating a device
      this.adminService.createDevicePublic(this.newDevice).subscribe({
        next: () => {
          Swal.close();
          this.showSuccessAlert('Device added successfully!');
          this.loadDevices();
          this.closeModal();
        },
        error: (err) => {
          Swal.close();
          this.showErrorAlert('Failed to add device.', err.message);
        }
      });
    }
  }

  closeModal(): void {
    this.showDeviceModal = false;
    this.selectedDevice = null;
    this.newDevice = {};
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
