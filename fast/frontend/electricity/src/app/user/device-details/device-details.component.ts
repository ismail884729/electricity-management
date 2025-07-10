import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Device, UserService, UserWithDevices } from '../../services/user.service';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css']
})
export class DeviceDetailsComponent implements OnInit {
  devices: Device[] = [];
  selectedDevice?: Device;
  isLoading = true;
  deviceId?: number;
  userId?: number;
  userWithDevices?: UserWithDevices;
  
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the device ID from the route params
    this.route.paramMap.subscribe(params => {
      const deviceIdParam = params.get('id');
      if (deviceIdParam) {
        this.deviceId = +deviceIdParam; // Convert to number
      }
      
      // Get current user
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.userId = currentUser.id;
        this.loadUserWithDevices(currentUser.id);
      } else {
        this.showError('User not found');
      }
    });
  }
  
  loadUserWithDevices(userId: number): void {
    this.isLoading = true;
    Swal.fire({
      title: 'Loading Device Information',
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    this.userService.getUserWithDevices(userId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          Swal.close();
        })
      )
      .subscribe({
        next: (data) => {
          this.userWithDevices = data;
          this.devices = data.devices || [];
          
          // If we have a device ID from the route, select that device
          if (this.deviceId) {
            const device = this.devices.find(d => d.id === this.deviceId);
            if (device) {
              this.selectedDevice = device;
              Swal.fire({
                icon: 'success',
                title: 'Device Information Loaded',
                text: 'Device details have been successfully loaded.',
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#00897b' // Changed to match buy-electricity
              });
            } else {
              this.showError('Device not found');
            }
          } 
          // Otherwise select the first device if available
          else if (this.devices.length > 0) {
            this.selectedDevice = this.devices[0];
            Swal.fire({
              icon: 'success',
              title: 'Device Information Loaded',
              text: 'Device details have been successfully loaded.',
              timer: 1500,
              showConfirmButton: false,
              confirmButtonColor: '#00897b' // Changed to match buy-electricity
            });
          } else {
            Swal.fire({
              icon: 'info',
              title: 'No Devices Found',
              text: 'No devices are associated with this user.',
              confirmButtonColor: '#00897b' // Changed to match buy-electricity
            });
          }
        },
        error: (error) => {
          console.error('Error loading devices:', error);
          this.showError('Failed to load devices. Please try again later.');
        }
      });
  }

  selectDevice(device: Device): void {
    this.selectedDevice = device;
  }
  
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  showError(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonColor: '#d33' // Keep red for errors
    });
  }
}
