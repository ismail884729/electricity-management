import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { RateInfo, UserService } from '../../services/user.service';

@Component({
  selector: 'app-buy-electricity',
  templateUrl: './buy-electricity.component.html',
  styleUrls: ['./buy-electricity.component.css']
})
export class BuyElectricityComponent implements OnInit {
  amount: number = 0;
  units: number = 0;
  selectedMeter: string = '';
  paymentMethod: string = '';
  isProcessing: boolean = false;
  transactionComplete: boolean = false;
  showChatbot: boolean = false;
  errorMessage: string = '';
  transactionId: string = '';
  
  // New properties for rate information
  currentRate: RateInfo | null = null;
  calculatedCost: string = '';
  isCalculating: boolean = false;
  costPerUnit: number = 0;

  meters = [
    { id: 'MET-12345', location: 'Main Entrance' },
    { id: 'SM-003', location: 'Garage' }
  ];

  paymentMethods = [
    { id: 'credit', name: 'Credit Card' },
    { id: 'debit', name: 'Debit Card' },
    { id: 'paypal', name: 'PayPal' },
    { id: 'bank', name: 'Bank Transfer' }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Load the current active electricity rate
    this.loadActiveRate();
    
    // Load user devices/meters
    this.loadUserDevices();
  }
  
  loadActiveRate(): void {
    this.userService.getActiveRate().subscribe({
      next: (rate) => {
        this.currentRate = rate;
        this.costPerUnit = rate.price_per_unit;
      },
      error: (error) => {
        console.error('Error loading active rate:', error);
        Swal.fire({
          title: 'Error',
          text: 'Unable to load current electricity rates. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
  
  loadUserDevices(): void {
    this.userService.getUserDevices().subscribe({
      next: (devices) => {
        if (devices && devices.length > 0) {
          this.meters = devices.map(device => ({
            id: device.serial_number,
            location: device.device_name
          }));
        }
      },
      error: (error) => {
        console.error('Error loading devices:', error);
      }
    });
  }
  
  calculateUnits(): void {
    if (this.amount <= 0 || !this.costPerUnit) {
      this.units = 0;
      this.calculatedCost = '';
      return;
    }
    
    // Basic calculation based on local rate
    this.units = Math.floor(this.amount / this.costPerUnit);
    
    // Get more accurate calculation from API
    this.getCalculatedCost();
  }
  
  getCalculatedCost(): void {
    if (this.units <= 0) return;
    
    this.isCalculating = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      // If we have a user ID and device ID, use the user-specific endpoint
      this.userService.calculatePurchaseForUser(
        currentUser.id, 
        this.units,
        this.selectedMeter
      ).subscribe({
        next: (result) => {
          this.calculatedCost = result;
          this.isCalculating = false;
        },
        error: (error) => {
          console.error('Error calculating purchase for user:', error);
          this.isCalculating = false;
          // Fall back to basic calculation
          this.calculatedCost = `TSh ${(this.units * this.costPerUnit).toLocaleString()}`;
        }
      });
    } else {
      // Otherwise use the general endpoint
      this.userService.calculatePurchase(this.units).subscribe({
        next: (result) => {
          this.calculatedCost = result;
          this.isCalculating = false;
        },
        error: (error) => {
          console.error('Error calculating purchase:', error);
          this.isCalculating = false;
          // Fall back to basic calculation
          this.calculatedCost = `TSh ${(this.units * this.costPerUnit).toLocaleString()}`;
        }
      });
    }
  }

  processPayment(): void {
    // Validate form
    if (!this.selectedMeter || !this.paymentMethod || this.amount <= 0) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    // Confirm purchase with SweetAlert
    Swal.fire({
      title: 'Confirm Purchase',
      html: `
        <p>You are about to purchase <strong>${this.units} kWh</strong> of electricity.</p>
        <p>Cost: <strong>${this.calculatedCost || 'TSh ' + (this.units * this.costPerUnit).toLocaleString()}</strong></p>
        <p>Meter: <strong>${this.selectedMeter}</strong></p>
        <p>Payment method: <strong>${this.getPaymentMethodName()}</strong></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm Purchase',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#00897b',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.executePayment();
      }
    });
  }
  
  getPaymentMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.paymentMethod);
    return method ? method.name : this.paymentMethod;
  }
  
  executePayment(): void {
    this.errorMessage = '';
    this.isProcessing = true;

    this.userService.buyElectricity(this.amount, this.paymentMethod).subscribe({
      next: (transaction) => {
        this.isProcessing = false;
        this.transactionComplete = true;
        this.transactionId = `TXN-${transaction.id}`;
        
        // Show success message
        Swal.fire({
          title: 'Purchase Successful!',
          text: `You have successfully purchased ${this.units} kWh of electricity.`,
          icon: 'success',
          confirmButtonColor: '#00897b'
        });
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Payment failed:', error);
        
        // Show error message
        Swal.fire({
          title: 'Purchase Failed',
          text: error.error?.detail || error.error?.message || 'There was an error processing your payment. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  resetForm(): void {
    this.amount = 0;
    this.units = 0;
    this.selectedMeter = '';
    this.paymentMethod = '';
    this.transactionComplete = false;
    this.errorMessage = '';
  }

  toggleChatbot(): void {
    this.showChatbot = !this.showChatbot;
  }
}
