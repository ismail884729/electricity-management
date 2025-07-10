import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { RateInfo, UserService, Device } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-buy-electricity',
  templateUrl: './buy-electricity.component.html',
  styleUrls: ['./buy-electricity.component.css']
})
export class BuyElectricityComponent implements OnInit {
  amount: number = 0;
  units: number = 0;
  selectedMeter: string = '';
  paymentMethod: string = 'direct';
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
  transactionFeePercentage: number = 0.04; // Assuming a 4% transaction fee based on user feedback (1000 -> 960)
  netAmount: number = 0; // The amount after deducting fees

  meters: Device[] = [];

  paymentMethods = [
    { id: 'direct', name: 'Direct Method' }
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
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserDevices(currentUser.id).subscribe({
        next: (devices) => {
          if (devices && devices.length > 0) {
            this.meters = devices;
            const primaryDevice = devices.find(d => d.is_primary);
            if (primaryDevice) {
              this.selectedMeter = primaryDevice.device_id;
            } else {
              this.selectedMeter = devices[0].device_id;
            }
          }
        },
        error: (error) => {
          console.error('Error loading devices:', error);
        }
      });
    }
  }
  
  calculateUnits(): void {
    if (this.amount <= 0 || !this.costPerUnit) {
      this.units = 0;
      this.calculatedCost = '';
      return;
    }
    
    // Calculate units based on the exact monetary amount
    this.units = this.amount / this.costPerUnit;
    
    // Calculate the net amount after deducting the transaction fee
    this.netAmount = this.amount * (1 - this.transactionFeePercentage);

    // The calculated cost is the net amount that will be credited
    this.calculatedCost = `TSh ${this.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  processPayment(): void {
    // Validate form
    if (!this.selectedMeter || !this.paymentMethod || this.amount <= 0 || this.units <= 0) {
      this.errorMessage = 'Please fill all required fields and enter a valid amount.';
      return;
    }

    // Confirm purchase with SweetAlert
    Swal.fire({
      title: 'Confirm Purchase',
      html: `
        <p>You are about to purchase <strong>${this.units.toFixed(2)} kWh</strong> of electricity.</p>
        <p>Amount entered: <strong>TSh ${this.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        <p>Transaction Fee (${(this.transactionFeePercentage * 100).toFixed(0)}%): <strong>TSh ${(this.amount * this.transactionFeePercentage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        <p>Net Amount (credited to meter): <strong>TSh ${this.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
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
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.userService.buyUnits(currentUser.id, this.units, this.paymentMethod, this.selectedMeter).subscribe({
        next: (transaction) => {
          this.isProcessing = false;
          this.transactionComplete = true;
          this.transactionId = transaction.transaction_reference;
          
          // Refresh user balance after successful purchase
          this.authService.fetchCurrentUser().subscribe({
            next: (user) => {
              console.log('User balance refreshed:', user.unit_balance);
            },
            error: (err) => {
              console.error('Error refreshing user balance after purchase:', err);
            }
          });

          // Show success message with the actual amount charged
          Swal.fire({
            title: 'Purchase Successful!',
            html: `You have successfully purchased <strong>${this.units.toFixed(2)} kWh</strong> of electricity.<br>
                   Amount charged: <strong>TSh ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>`,
            icon: 'success',
            confirmButtonColor: '#00897b'
          });
        },
        error: (error: HttpErrorResponse) => {
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
  }

  resetForm(): void {
    this.amount = 0;
    this.units = 0;
    this.selectedMeter = '';
    this.paymentMethod = 'direct';
    this.transactionComplete = false;
    this.errorMessage = '';
  }

  toggleChatbot(): void {
    this.showChatbot = !this.showChatbot;
  }
}
