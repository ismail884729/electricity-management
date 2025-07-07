import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './auth.service';

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  payment_method: string;
  status: string;
  transaction_date: string;
  units_purchased: number;
}

export interface Device {
  id: number;
  user_id: number;
  device_name: string;
  device_type: string;
  serial_number: string;
  status: string;
  installation_date: string;
  last_reading: number;
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
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  // Update user profile
  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/me`, userData);
  }

  // Get user transactions
  getUserTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/users/transactions`);
  }

  // Get user devices
  getUserDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}/users/devices`);
  }

  // Get device details
  getDeviceDetails(deviceId: number): Observable<Device> {
    return this.http.get<Device>(`${this.apiUrl}/users/devices/${deviceId}`);
  }

  // Get usage statistics
  getUsageStatistics(deviceId?: number): Observable<UsageData[]> {
    const url = deviceId 
      ? `${this.apiUrl}/users/usage?device_id=${deviceId}`
      : `${this.apiUrl}/users/usage`;
    return this.http.get<UsageData[]>(url);
  }

  // Buy electricity units
  buyElectricity(amount: number, paymentMethod: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/users/buy`, {
      amount,
      payment_method: paymentMethod
    });
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
