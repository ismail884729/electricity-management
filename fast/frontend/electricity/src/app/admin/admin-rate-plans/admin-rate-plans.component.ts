import { Component, OnInit } from '@angular/core';
import { AdminService, RatePlan } from '../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-rate-plans',
  templateUrl: './admin-rate-plans.component.html',
  styleUrls: ['./admin-rate-plans.component.css']
})
export class AdminRatePlansComponent implements OnInit {
  ratePlans: RatePlan[] = [];
  filteredRatePlans: RatePlan[] = [];
  searchTerm: string = '';

  showPlanForm: boolean = false;
  isEditMode: boolean = false;
  currentPlan: Partial<RatePlan> = {};

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadRatePlans();
  }

  loadRatePlans(): void {
    this.adminService.getAllRatePlans().subscribe(plans => {
      this.ratePlans = plans;
      this.filteredRatePlans = plans;
    });
  }

  filterPlans(): void {
    if (!this.searchTerm) {
      this.filteredRatePlans = [...this.ratePlans];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredRatePlans = this.ratePlans.filter(plan =>
      plan.rate_name.toLowerCase().includes(searchLower)
    );
  }

  showAddPlanForm(): void {
    this.isEditMode = false;
    this.currentPlan = {
      rate_name: '',
      price_per_unit: 0,
      is_active: true,
      effective_date: new Date().toISOString().split('T')[0]
    };
    this.showPlanForm = true;
  }

  editPlan(plan: RatePlan): void {
    this.isEditMode = true;
    this.currentPlan = { ...plan };
    this.showPlanForm = true;
  }

  savePlan(): void {
    this.showLoadingAlert('Saving Rate Plan...');
    if (this.isEditMode && this.currentPlan.id) {
      this.adminService.updateRatePlan(this.currentPlan.id, this.currentPlan).subscribe({
        next: () => {
          Swal.close();
          this.showSuccessAlert('Rate Plan updated successfully!');
          this.loadRatePlans();
          this.cancelForm();
        },
        error: (err) => {
          Swal.close();
          this.showErrorAlert('Failed to update rate plan.', err.message);
        }
      });
    } else {
      this.adminService.addRateJsonPublic(this.currentPlan).subscribe({
        next: () => {
          Swal.close();
          this.showSuccessAlert('Rate Plan created successfully!');
          this.loadRatePlans();
          this.cancelForm();
        },
        error: (err) => {
          Swal.close();
          this.showErrorAlert('Failed to create rate plan.', err.message);
        }
      });
    }
  }

  deletePlan(planId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this rate plan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.showLoadingAlert('Deleting Rate Plan...');
        this.adminService.deleteRatePlan(planId).subscribe({
          next: () => {
            Swal.close();
            this.showSuccessAlert('Rate Plan deleted successfully!');
            this.loadRatePlans();
          },
          error: (err) => {
            Swal.close();
            this.showErrorAlert('Failed to delete rate plan.', err.message);
          }
        });
      }
    });
  }

  togglePlanStatus(plan: RatePlan): void {
    this.showLoadingAlert('Updating Rate Plan Status...');
    this.adminService.activateRatePlan(plan.id).subscribe({
      next: () => {
        Swal.close();
        this.showSuccessAlert('Rate Plan status updated successfully!');
        this.loadRatePlans();
      },
      error: (err) => {
        Swal.close();
        this.showErrorAlert('Failed to update rate plan status.', err.message);
      }
    });
  }

  cancelForm(): void {
    this.showPlanForm = false;
    this.currentPlan = {};
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
