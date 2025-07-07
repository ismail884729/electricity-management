import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BuyElectricityComponent } from './buy-electricity/buy-electricity.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { SupportComponent } from './support/support.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { UsageStatisticsComponent } from './usage-statistics/usage-statistics.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  { 
    path: 'dashboard', 
    component: UserDashboardComponent,
    children: [
      { path: 'profile', component: UserProfileComponent },
      { path: 'devices', component: DeviceDetailsComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'buy-electricity', component: BuyElectricityComponent },
      { path: 'statistics', component: UsageStatisticsComponent },
      { path: 'support', component: SupportComponent },
      { path: 'chatbot', component: ChatbotComponent },
      { path: '', redirectTo: '', pathMatch: 'full' } // Empty path to show default dashboard content
    ] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
