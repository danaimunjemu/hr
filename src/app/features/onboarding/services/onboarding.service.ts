import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmployeeDto {
  id?: number;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
  employeeNumber: string;
  dateJoined: string;
  
  company: { id: number };
  position: { id: number };
  jobDescription: { id: number };
  organizationalUnit: { id: number };
  personnelArea: { id: number };
  personnelSubArea: { id: number };
  workContract: { id: number };
  workScheduleRule: { id: number };
  costCenter: { id: number };
  group: { id: number };
  subGroup: { id: number };
  psGroup: { id: number };
  ethnicGroup: { id: number };
}

export interface UserDto {
  username: string;
  email: string;
  phoneNumber: string;
  employee: { id: number };
  roles: { id: number }[];
}

export interface ActivateAccountRequest {
  username: string;
}

export interface PasswordResetRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly API_URL = 'http://localhost:8090/api'; // Base API URL

  constructor(private http: HttpClient) {}

  // 1. Create Employee
  createEmployee(employee: EmployeeDto): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(`${this.API_URL}/employee`, employee);
  }

  // 2. Create User (Linked to Employee)
  registerUser(user: UserDto): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/register`, user);
  }

  // 3. Activate Account (Send OTP)
  activateAccount(request: ActivateAccountRequest): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.API_URL}/auth/activate-account`, request);
  }

  // 4. Set Password (OTP Confirmation)
  setPassword(otp: string, request: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/password-reset/${otp}`, request);
  }
}
