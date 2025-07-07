import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminBillingComponent } from './admin-billing/admin-billing.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminDevicesComponent } from './admin-devices/admin-devices.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminRatePlansComponent } from './admin-rate-plans/admin-rate-plans.component';
import { AdminReportsComponent } from './admin-reports/admin-reports.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminTransactionsComponent } from './admin-transactions/admin-transactions.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

const routes: Routes = [
  { 
    path: '', 
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'devices', component: AdminDevicesComponent },
      { path: 'billing', component: AdminBillingComponent },
      { path: 'transactions', component: AdminTransactionsComponent },
      { path: 'rate-plans', component: AdminRatePlansComponent },
      { path: 'reports', component: AdminReportsComponent },
      { path: 'settings', component: AdminSettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
