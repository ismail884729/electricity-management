import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './auth.service';
import { Device, Transaction } from './user.service';

export interface Setting {
  setting_key: string;
  setting_value: string;
  description: string;
  id: number;
  updated_by: number;
  updated_at: string;
}

export interface RatePlan {
  id: number;
  rate_name: string;
  price_per_unit: number;
  is_active: boolean;
  effective_date: string;
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
  getAllUsers(params: { skip?: number; limit?: number; is_active?: boolean; role?: string } = {}): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { params });
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

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
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

  // Settings management
  getAllSettings(params: { skip?: number; limit?: number } = {}): Observable<Setting[]> {
    return this.http.get<Setting[]>(`${this.apiUrl}/settings`, { params });
  }

  getSettingByKey(settingKey: string): Observable<Setting> {
    return this.http.get<Setting>(`${this.apiUrl}/settings/${settingKey}`);
  }

  createSetting(settingData: Partial<Setting>): Observable<Setting> {
    return this.http.post<Setting>(`${this.apiUrl}/settings`, settingData);
  }

  updateSetting(settingKey: string, settingData: Partial<Setting>): Observable<Setting> {
    return this.http.put<Setting>(`${this.apiUrl}/settings/${settingKey}`, settingData);
  }

  deleteSetting(settingKey: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/settings/${settingKey}`);
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

  // Simplified public endpoints (assuming they are still managed by admin service for now)
  createDevicePublic(deviceData: Partial<Device>): Observable<Device> {
    return this.http.post<Device>(`${environment.apiUrl}/create-device`, deviceData);
  }

  addRateJsonPublic(rateData: Partial<RatePlan>): Observable<RatePlan> {
    return this.http.post<RatePlan>(`${environment.apiUrl}/add-rate-json`, rateData);
  }

  // Billing management
  getBillingTransactions(params: { skip?: number; limit?: number; status?: string; payment_method?: string; start_date?: string; end_date?: string } = {}): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/billing`, { params });
  }

  getBillingStatistics(): Observable<{ total_revenue: number; total_transactions: number; average_transaction_value: number }> {
    return this.http.get<{ total_revenue: number; total_transactions: number; average_transaction_value: number }>(`${this.apiUrl}/billing/statistics`);
  }

  // Transactions management
  getAllTransactions(params: { skip?: number; limit?: number; status?: string; payment_method?: string; start_date?: string; end_date?: string } = {}): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`, { params });
  }

  getTransactionsSummary(params: { start_date?: string; end_date?: string } = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/transactions/summary`, { params });
  }

  exportTransactionsCsv(params: { status?: string; payment_method?: string; start_date?: string; end_date?: string } = {}): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/transactions/export`, { params, responseType: 'blob' });
  }

  // Rate plans management
  getAllRatePlans(params: { skip?: number; limit?: number } = {}): Observable<RatePlan[]> {
    return this.http.get<RatePlan[]>(`${this.apiUrl}/rates`, { params });
  }

  getRatePlanById(rateId: number): Observable<RatePlan> {
    return this.http.get<RatePlan>(`${this.apiUrl}/rates/${rateId}`);
  }

  createRatePlan(planData: Partial<RatePlan>): Observable<RatePlan> {
    return this.http.post<RatePlan>(`${this.apiUrl}/rates`, planData);
  }

  updateRatePlan(rateId: number, planData: Partial<RatePlan>): Observable<RatePlan> {
    return this.http.put<RatePlan>(`${this.apiUrl}/rates/${rateId}`, planData);
  }

  deleteRatePlan(rateId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rates/${rateId}`);
  }

  activateRatePlan(rateId: number): Observable<RatePlan> {
    return this.http.patch<RatePlan>(`${this.apiUrl}/rates/${rateId}/activate`, {});
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
