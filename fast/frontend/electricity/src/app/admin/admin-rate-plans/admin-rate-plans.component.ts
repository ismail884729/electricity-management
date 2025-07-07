import { Component, OnInit } from '@angular/core';

interface RatePlan {
  id: string;
  name: string;
  type: string;
  baseRate: number;
  peakRate: number;
  offPeakRate: number;
  status: string;
  description?: string;
}

@Component({
  selector: 'app-admin-rate-plans',
  templateUrl: './admin-rate-plans.component.html',
  styleUrls: ['./admin-rate-plans.component.css']
})
export class AdminRatePlansComponent implements OnInit {
  // Rate plans data
  ratePlans: RatePlan[] = [];
  filteredRatePlans: RatePlan[] = [];
  
  // Search
  searchTerm: string = '';
  
  // Form state
  showPlanForm: boolean = false;
  isEditMode: boolean = false;
  currentPlan: RatePlan = {
    id: '',
    name: '',
    type: 'Fixed',
    baseRate: 0.00,
    peakRate: 0.00,
    offPeakRate: 0.00,
    status: 'Active',
    description: ''
  };

  constructor() { }

  ngOnInit(): void {
    this.loadRatePlans();
  }

  loadRatePlans(): void {
    // In a real application, this would come from a service
    this.ratePlans = [
      {
        id: 'RP-001',
        name: 'Standard Residential Plan',
        type: 'Fixed',
        baseRate: 0.12,
        peakRate: 0.18,
        offPeakRate: 0.08,
        status: 'Active',
        description: 'Basic residential electricity plan with fixed rates.'
      },
      {
        id: 'RP-002',
        name: 'Time-of-Use Residential',
        type: 'Time-of-Use',
        baseRate: 0.10,
        peakRate: 0.22,
        offPeakRate: 0.06,
        status: 'Active',
        description: 'Residential plan with different rates based on time of day.'
      },
      {
        id: 'RP-003',
        name: 'Business Standard',
        type: 'Commercial',
        baseRate: 0.09,
        peakRate: 0.15,
        offPeakRate: 0.07,
        status: 'Active',
        description: 'Standard rate plan for small to medium businesses.'
      },
      {
        id: 'RP-004',
        name: 'Seasonal Flex',
        type: 'Seasonal',
        baseRate: 0.11,
        peakRate: 0.20,
        offPeakRate: 0.09,
        status: 'Inactive',
        description: 'Seasonal rates that adjust based on demand patterns throughout the year.'
      },
      {
        id: 'RP-005',
        name: 'Industrial Power',
        type: 'Industrial',
        baseRate: 0.08,
        peakRate: 0.14,
        offPeakRate: 0.05,
        status: 'Active',
        description: 'High-volume plan for industrial customers with specialized needs.'
      }
    ];
    
    this.filteredRatePlans = [...this.ratePlans];
  }

  filterPlans(): void {
    if (!this.searchTerm) {
      this.filteredRatePlans = [...this.ratePlans];
      return;
    }
    
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredRatePlans = this.ratePlans.filter(plan => 
      plan.name.toLowerCase().includes(searchLower) || 
      plan.type.toLowerCase().includes(searchLower) ||
      plan.id.toLowerCase().includes(searchLower)
    );
  }

  showAddPlanForm(): void {
    this.isEditMode = false;
    this.currentPlan = {
      id: `RP-${this.generateRandomId()}`,
      name: '',
      type: 'Fixed',
      baseRate: 0.00,
      peakRate: 0.00,
      offPeakRate: 0.00,
      status: 'Active',
      description: ''
    };
    this.showPlanForm = true;
  }

  editPlan(plan: RatePlan): void {
    this.isEditMode = true;
    // Create a copy to avoid direct reference modification
    this.currentPlan = { ...plan };
    this.showPlanForm = true;
  }

  savePlan(): void {
    if (this.isEditMode) {
      // Update existing plan
      const index = this.ratePlans.findIndex(p => p.id === this.currentPlan.id);
      if (index !== -1) {
        this.ratePlans[index] = { ...this.currentPlan };
      }
    } else {
      // Add new plan
      this.ratePlans.push({ ...this.currentPlan });
    }
    
    // Reset and update filtered list
    this.filterPlans();
    this.cancelForm();
  }

  deletePlan(planId: string): void {
    if (confirm('Are you sure you want to delete this rate plan?')) {
      this.ratePlans = this.ratePlans.filter(plan => plan.id !== planId);
      this.filterPlans();
    }
  }

  cancelForm(): void {
    this.showPlanForm = false;
  }

  private generateRandomId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
