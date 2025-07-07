import { Component, OnInit } from '@angular/core';

interface Device {
  id: string;
  type: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  location: string;
  owner: string;
  status: string;
  lastReading: number;
  unit: string;
  lastConnected: string;
  firmwareVersion: string;
}

interface DiagnosticTest {
  name: string;
  status: 'passed' | 'failed' | 'pending';
}

@Component({
  selector: 'app-admin-devices',
  templateUrl: './admin-devices.component.html',
  styleUrls: ['./admin-devices.component.css']
})
export class AdminDevicesComponent implements OnInit {
  // Device data
  devices: Device[] = [];
  filteredDevices: Device[] = [];
  
  // Search and filter
  searchTerm: string = '';
  statusFilter: string = 'all';
  typeFilter: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  
  // Modal
  showDeviceModal: boolean = false;
  modalTitle: string = '';
  modalMode: 'view' | 'edit' | 'diagnose' = 'view';
  selectedDevice: Device | null = null;
  
  // Diagnostics
  diagnosticTests: DiagnosticTest[] = [
    { name: 'Connection Test', status: 'pending' },
    { name: 'Firmware Validation', status: 'pending' },
    { name: 'Data Integrity Check', status: 'pending' },
    { name: 'Security Audit', status: 'pending' },
    { name: 'Sensor Calibration', status: 'pending' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    // In a real application, this would come from a service
    this.devices = [
      {
        id: 'DEV-001',
        type: 'smart-meter',
        model: 'SmartMeter X1',
        serialNumber: 'SM123456789',
        installationDate: '2023-05-15',
        location: '123 Main St, Apt 4B',
        owner: 'John Smith',
        status: 'active',
        lastReading: 457.8,
        unit: 'kWh',
        lastConnected: '2023-07-06 14:32',
        firmwareVersion: '2.3.1'
      },
      {
        id: 'DEV-002',
        type: 'solar-inverter',
        model: 'SolarMax 3000',
        serialNumber: 'SI987654321',
        installationDate: '2023-04-22',
        location: '456 Oak Ave',
        owner: 'Jane Doe',
        status: 'active',
        lastReading: 12.5,
        unit: 'kW',
        lastConnected: '2023-07-06 15:10',
        firmwareVersion: '1.8.0'
      },
      {
        id: 'DEV-003',
        type: 'battery',
        model: 'PowerWall Pro',
        serialNumber: 'BP567891234',
        installationDate: '2023-06-10',
        location: '789 Pine Rd',
        owner: 'Robert Johnson',
        status: 'inactive',
        lastReading: 85.2,
        unit: '%',
        lastConnected: '2023-07-05 09:45',
        firmwareVersion: '3.2.1'
      },
      {
        id: 'DEV-004',
        type: 'ev-charger',
        model: 'ChargePoint Home',
        serialNumber: 'EV432198765',
        installationDate: '2023-03-18',
        location: '567 Elm St',
        owner: 'Sarah Williams',
        status: 'maintenance',
        lastReading: 0,
        unit: 'kW',
        lastConnected: '2023-07-01 18:20',
        firmwareVersion: '2.0.5'
      },
      {
        id: 'DEV-005',
        type: 'smart-meter',
        model: 'SmartMeter X1',
        serialNumber: 'SM234567890',
        installationDate: '2023-05-20',
        location: '890 Maple Ave',
        owner: 'Michael Brown',
        status: 'error',
        lastReading: 0,
        unit: 'kWh',
        lastConnected: '2023-07-02 10:15',
        firmwareVersion: '2.3.1'
      }
    ];
    
    this.filteredDevices = [...this.devices];
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

  applyFilters(): void {
    let filtered = [...this.devices];
    
    // Apply search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(device => 
        device.id.toLowerCase().includes(searchLower) ||
        device.location.toLowerCase().includes(searchLower) ||
        device.owner.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(device => device.status === this.statusFilter);
    }
    
    // Apply type filter
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(device => device.type === this.typeFilter);
    }
    
    this.filteredDevices = filtered;
    this.calculatePagination();
    this.currentPage = 1; // Reset to first page
  }

  refreshDevices(): void {
    // In a real app, this would refresh data from the server
    this.loadDevices();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewDeviceDetails(device: Device): void {
    this.selectedDevice = {...device};
    this.modalTitle = 'Device Details';
    this.modalMode = 'view';
    this.showDeviceModal = true;
  }

  editDevice(device: Device): void {
    this.selectedDevice = {...device};
    this.modalTitle = 'Edit Device';
    this.modalMode = 'edit';
    this.showDeviceModal = true;
  }

  diagnoseDevice(device: Device): void {
    this.selectedDevice = {...device};
    this.modalTitle = 'Device Diagnostics';
    this.modalMode = 'diagnose';
    this.showDeviceModal = true;
    
    // Reset diagnostic tests
    this.diagnosticTests.forEach(test => test.status = 'pending');
    
    // Simulate running diagnostics
    setTimeout(() => this.simulateDiagnosticResults(), 2000);
  }

  simulateDiagnosticResults(): void {
    // Simulate diagnostic test results
    this.diagnosticTests.forEach(test => {
      test.status = Math.random() > 0.2 ? 'passed' : 'failed';
    });
  }

  toggleDeviceStatus(device: Device): void {
    const index = this.devices.findIndex(d => d.id === device.id);
    if (index !== -1) {
      this.devices[index].status = device.status === 'active' ? 'inactive' : 'active';
      this.filteredDevices = [...this.devices];
    }
  }

  runFullDiagnostic(): void {
    // Reset and run diagnostics again
    this.diagnosticTests.forEach(test => test.status = 'pending');
    setTimeout(() => this.simulateDiagnosticResults(), 2000);
  }

  switchToEditMode(): void {
    this.modalTitle = 'Edit Device';
    this.modalMode = 'edit';
  }

  saveDeviceChanges(): void {
    if (!this.selectedDevice) return;
    
    const index = this.devices.findIndex(d => d.id === this.selectedDevice!.id);
    if (index !== -1) {
      this.devices[index] = {...this.selectedDevice};
      this.applyFilters(); // Re-apply filters to update the view
      this.closeModal();
    }
  }

  closeModal(): void {
    this.showDeviceModal = false;
    this.selectedDevice = null;
  }
}
