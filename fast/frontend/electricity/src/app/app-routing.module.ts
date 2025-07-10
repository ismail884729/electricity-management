import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { GuestDashboardComponent } from './guest-dashboard/guest-dashboard.component';
import { LoginComponent } from './login/login.component';
// import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';

const routes: Routes = [
  { path: '', component: GuestDashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard] },
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule), canActivate: [AuthGuard] },
  { path: 'dashboard', redirectTo: 'user/dashboard', pathMatch: 'full' }, // Redirect to user dashboard by default
  
  { path: '**', redirectTo: '' } // Redirect any unknown routes to the dashboard
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
