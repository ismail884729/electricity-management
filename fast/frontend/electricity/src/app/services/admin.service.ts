import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './auth.service';
import { Device, Transaction } from './user.service';

export interface RatePlan {
  id: number;
  name: string;
  price_per_unit: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_devices: number;
  total_revenue: number;
  active_devices: number;
  units_sold: number;
  recent_transactions: Transaction[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  // Dashboard statistics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  // User management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData);
  }

  setAdminRole(userId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/${userId}/set_admin_role`, {});
  }

  deactivateUser(userId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/${userId}/deactivate`, {});
  }

  activateUser(userId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/${userId}/activate`, {});
  }

  // Device management
  getAllDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}/devices`);
  }

  getDeviceById(deviceId: number): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/devices/${deviceId}`);
  }

  addDevice(deviceData: Partial<Device>): Observable<Device> {
    return this.http.post<Device>(`${this.apiUrl}/devices`, deviceData);
  }

  updateDevice(deviceId: number, deviceData: Partial<Device>): Observable<Device> {
    return this.http.put<Device>(`${this.apiUrl}/devices/${deviceId}`, deviceData);
  }

  // Transactions management
  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  getTransactionById(transactionId: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/transactions/${transactionId}`);
  }

  updateTransactionStatus(transactionId: number, status: string): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${transactionId}`, { status });
  }

  // Rate plans management
  getAllRatePlans(): Observable<RatePlan[]> {
    return this.http.get<RatePlan[]>(`${this.apiUrl}/rate-plans`);
  }

  getRatePlanById(planId: number): Observable<RatePlan> {
    return this.http.get<RatePlan>(`${this.apiUrl}/rate-plans/${planId}`);
  }

  createRatePlan(planData: Partial<RatePlan>): Observable<RatePlan> {
    return this.http.post<RatePlan>(`${this.apiUrl}/rate-plans`, planData);
  }

  updateRatePlan(planId: number, planData: Partial<RatePlan>): Observable<RatePlan> {
    return this.http.put<RatePlan>(`${this.apiUrl}/rate-plans/${planId}`, planData);
  }

  activateRatePlan(planId: number): Observable<RatePlan> {
    return this.http.post<RatePlan>(`${this.apiUrl}/rate-plans/${planId}/activate`, {});
  }

  deactivateRatePlan(planId: number): Observable<RatePlan> {
    return this.http.post<RatePlan>(`${this.apiUrl}/rate-plans/${planId}/deactivate`, {});
  }

  // Reports and analytics
  getRevenueReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/revenue`, {
      params: { start_date: startDate, end_date: endDate }
    });
  }

  getUserAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/users`);
  }

  getConsumptionReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/consumption`, {
      params: { start_date: startDate, end_date: endDate }
    });
  }
}
