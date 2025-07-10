import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './auth.service';

export interface Transaction {
  id: number;
  amount: number;
  units_purchased: number;
  transaction_reference: string;
  status: string;
  balance_before: number;
  balance_after: number;
  payment_method: string;
  device_id: string;
  notes: string;
  created_at: string;
  completed_at: string;
  rate_id: number;
  rate_name: string;
  price_per_unit: number;
  user_id: number;
  username: string;
  user_email: string;
  user_full_name: string;
  user_phone_number: string;
  device_name: string;
}

export interface Device {
  id: number;
  device_id: string;
  user_id: number;
  device_name: string;
  is_online: boolean;
  last_seen: string | null;
  unit_balance: number;
  signal_strength: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageData {
  date: string;
  consumption: number;
}

export interface RateInfo {
  rate_name: string;
  price_per_unit: number;
  is_active: boolean;
  id: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithDevices extends User {
  devices: Device[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // Get current user profile
  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`, { 
      responseType: 'json',
      headers: { 'Accept': 'application/json' }
    });
  }

  // Update user profile
  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/me`, userData);
  }

  // Get user transactions
  getUserTransactions(userId: number, skip: number = 0, limit: number = 100, status?: string): Observable<Transaction[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Transaction[]>(`${this.apiUrl}/users/${userId}/transactions`, { params });
  }

  // Get user devices (now accepts both user ID and device ID)
  getUserDevices(identifier: number | string): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}/users/devices/${identifier}`);
  }

  // Get primary user device
  getPrimaryUserDevice(userId: number): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/users/devices/${userId}/primary`);
  }

  // Get device details (can be covered by getUserDevices now)
  // getDeviceDetails(deviceId: string): Observable<Device> {
  //   return this.http.get<Device>(`${this.apiUrl}/users/devices/${deviceId}`);
  // }

  // Get usage statistics for a specific user
  getUserUsage(userId: number): Observable<UsageData[]> {
    return this.http.get<UsageData[]>(`${this.apiUrl}/users/${userId}/usage`);
  }

  // Buy electricity units
  buyUnits(userId: number, units: number, paymentMethod: string, deviceId: string, notes?: string): Observable<Transaction> {
    const body = {
      units,
      payment_method: paymentMethod,
      device_id: deviceId,
      notes
    };
    return this.http.post<Transaction>(`${this.apiUrl}/users/buy-units/${userId}`, body);
  }

  // Submit support request
  submitSupportRequest(subject: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/support`, {
      subject,
      message
    });
  }
  
  // Get the currently active electricity rate
  getActiveRate(): Observable<RateInfo> {
    return this.http.get<RateInfo>(`${this.apiUrl}/active-rate`);
  }
  
  // Calculate purchase cost based on units (without user)
  calculatePurchase(units: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/calculate-purchase/${units}`);
  }
  
  // Calculate purchase cost for a specific user
  calculatePurchaseForUser(userId: number, units: number, deviceId?: string): Observable<string> {
    let url = `${this.apiUrl}/calculate-purchase/${userId}/${units}`;
    if (deviceId) {
      url += `?device_id=${deviceId}`;
    }
    return this.http.get<string>(url);
  }
  
  // Get user with all assigned devices
  getUserWithDevices(userId: number): Observable<UserWithDevices> {
    return this.http.get<UserWithDevices>(`${this.apiUrl}/users/${userId}/with-devices`);
  }
}
