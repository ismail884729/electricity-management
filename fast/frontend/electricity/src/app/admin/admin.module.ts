import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';

// Import admin components
import { AdminBillingComponent } from './admin-billing/admin-billing.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminDevicesComponent } from './admin-devices/admin-devices.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminRatePlansComponent } from './admin-rate-plans/admin-rate-plans.component';
import { AdminReportsComponent } from './admin-reports/admin-reports.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminTransactionsComponent } from './admin-transactions/admin-transactions.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminDevicesComponent,
    AdminBillingComponent,
    AdminTransactionsComponent,
    AdminRatePlansComponent,
    AdminReportsComponent,
    AdminSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
