import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Import user components from their individual locations
import { BuyElectricityComponent } from './buy-electricity/buy-electricity.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { SupportComponent } from './support/support.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { UsageStatisticsComponent } from './usage-statistics/usage-statistics.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [
    UserDashboardComponent,
    UserProfileComponent,
    DeviceDetailsComponent,
    TransactionsComponent,
    BuyElectricityComponent,
    UsageStatisticsComponent,
    SupportComponent,
    ChatbotComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UserRoutingModule
  ],
  exports: [
    UserDashboardComponent,
    UserProfileComponent,
    DeviceDetailsComponent,
    TransactionsComponent,
    BuyElectricityComponent,
    UsageStatisticsComponent,
    SupportComponent,
    ChatbotComponent
  ]
})
export class UserModule { }
