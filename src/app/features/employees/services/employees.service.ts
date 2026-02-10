import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface Address {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  physicalAddress: string;
  postalAddress: string;
}

export interface BankDetail {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranchCode: string;
}

export interface Company {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
  workLocation: string;
}

export interface CostCenter {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface Group {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface SubGroup {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface EthnicGroup {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface Grade {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface JobDescription {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface OrganizationalUnit {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface PersonnelArea {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface PersonnelSubArea {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface SecondSuperior {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

export interface Position {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
  superior: string;
  secondSuperior: SecondSuperior;
  subordinates: string[];
}

export interface PsGroup {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  name: string;
}

import { WorkContract } from '../../time-and-leave/models/work-contract.model';
import { WorkScheduleRule } from '../../time-and-leave/models/work-schedule-rule.model';

export interface EmployeeDto {
  firstName: string;
  lastName: string;
  nationalId: string;
  employeeNumber: string;
  gender: string;
  dateOfBirth: string;
  dateJoined: string;
  company?: { id: number };
  costCenter?: { id: number };
  group?: { id: number };
  subGroup?: { id: number };
  ethnicGroup?: { id: number };
  jobDescription?: { id: number };
  organizationalUnit?: { id: number };
  personnelArea?: { id: number };
  personnelSubArea?: { id: number };
  position?: { id: number };
  psGroup?: { id: number };
  workContract?: { id: number };
  workScheduleRule?: { id: number };
}

export interface RegisterUserRequest {
  /**
   * Required. Unique username for login.
   * Controlled by: Frontend (User input)
   */
  username: string;

  /**
   * Required. Plaintext password.
   * Controlled by: Frontend (User input)
   * Validation: Must match ^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\S).{10,}$
   */
  password: string;

  /**
   * Optional. User's email address.
   * Controlled by: Frontend (User input)
   */
  email?: string;

  /**
   * Optional. User's phone number.
   * Controlled by: Frontend (User input)
   */
  phoneNumber?: string;

  /**
   * Optional. List of roles to assign.
   * Controlled by: Frontend (Admin selection)
   * Context: Admin flow only. Self-registration usually omits this.
   */
  roles?: { id: number }[];

  /**
   * Optional. Link to an existing employee record.
   * Controlled by: Frontend (Admin selection/System context)
   * Context: Admin creating a user for an existing employee.
   */
  employee?: { id: number };
}

export interface PersonnelFile {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  employee: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  category: string;
  description: string;
  documentDate: string;
  expiryDate: string;
}

export interface Employee {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string;
  nationalId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  workPhone: string;
  mobilePhone: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  address?: Address;
  dateOfBirth: string;
  dateJoined: string;
  confirmationDate?: string;
  terminationDate?: string;
  bankDetail?: BankDetail;
  employmentStatus: string;
  superior?: string;
  subordinates?: string[];
  company?: Company;
  costCenter?: CostCenter;
  group?: Group;
  employmentType?: string;
  subGroup?: SubGroup;
  ethnicGroup?: EthnicGroup;
  grade?: Grade;
  jobDescription?: JobDescription;
  organizationalUnit?: OrganizationalUnit;
  personnelArea?: PersonnelArea;
  personnelSubArea?: PersonnelSubArea;
  position?: Position;
  psGroup?: PsGroup;
  workContract?: WorkContract;
  workScheduleRule?: WorkScheduleRule;
  personnelFiles?: PersonnelFile[];
  user?: {
    id: number;
    enabled: boolean;
    username: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private readonly API_URL = 'http://localhost:8090/api';
  private readonly EMPLOYEE_URL = `${this.API_URL}/employee`;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.EMPLOYEE_URL).pipe(
      catchError(error => {
        console.error('Error fetching employees', error);
        return throwError(() => new Error('Failed to fetch employees. Please try again later.'));
      })
    );
  }

  getAll(): Observable<Employee[]> {
    return this.getEmployees();
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.EMPLOYEE_URL}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching employee with id ${id}`, error);
        return throwError(() => new Error('Failed to fetch employee details.'));
      })
    );
  }

  getById(id: number): Observable<Employee> {
    return this.getEmployeeById(id);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.EMPLOYEE_URL}/${id}`, employee).pipe(
      catchError(error => {
        console.error(`Error updating employee with id ${id}`, error);
        return throwError(() => new Error('Failed to update employee.'));
      })
    );
  }

  assignSettings(id: number, payload: any): Observable<Employee> {
    return this.http.put<Employee>(`${this.API_URL}/employees/${id}`, payload).pipe(
      catchError(error => {
        console.error(`Error assigning settings to employee with id ${id}`, error);
        return throwError(() => new Error('Failed to update employee assignments.'));
      })
    );
  }

  registerUser(payload: RegisterUserRequest): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/auth/register`, payload).pipe(
      catchError(error => {
        console.error('Error registering user', error);
        return throwError(() => new Error('Failed to register user.'));
      })
    );
  }
}
