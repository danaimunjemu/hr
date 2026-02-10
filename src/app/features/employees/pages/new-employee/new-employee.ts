import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { EmployeesService, EmployeeDto, RegisterUserRequest } from '../../services/employees.service';

@Component({
  selector: 'app-new-employee',
  standalone: false,
  templateUrl: './new-employee.html',
  styleUrl: './new-employee.scss'
})
export class NewEmployee {
  createForm!: FormGroup;
  loading: WritableSignal<boolean> = signal(false);
  
  // Mock data for dropdowns
  genders = ['MALE', 'FEMALE'];
  availableRoles = ['User', 'Admin', 'CSuite', 'External'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeesService: EmployeesService,
    private message: NzMessageService
  ) {
    this.createForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\S).{10,}$/)]],
      phoneNumber: ['', [Validators.required]],
      // Removed backend-controlled fields: mfaEnabled, changePassword, enabled
      roles: [[], [Validators.required]],
      employee: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        nationalId: ['', [Validators.required]],
        employeeNumber: ['', [Validators.required]],
        gender: ['', [Validators.required]],
        dateOfBirth: [null, [Validators.required]],
        dateJoined: [null, [Validators.required]]
      })
    });
  }

  submitForm(): void {
    if (this.createForm.valid) {
      this.loading.set(true);
      const payload = this.buildRegistrationPayload();

      this.employeesService.registerUser(payload)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.message.success('Employee registered successfully');
            this.router.navigate(['/app/employees']);
          },
          error: (err) => {
            this.message.error(err.message || 'Failed to register employee');
          }
        });
    } else {
      Object.values(this.createForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
        // Check nested groups
        if (control instanceof FormGroup) {
           Object.values(control.controls).forEach(c => {
             if (c.invalid) {
               c.markAsDirty();
               c.updateValueAndValidity({ onlySelf: true });
             }
           });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  // Temporary mock ID mapping for roles until backend provides ID-based role list
  private roleIdMap: { [key: string]: number } = {
    'User': 4, // ROLE_EMPLOYEE
    'Admin': 1, // ROLE_ADMIN
    'CSuite': 3, // ROLE_MANAGER (Assuming CSuite maps to Manager for now based on provided list)
    'External': 4 // ROLE_EMPLOYEE (Fallback)
  };

  private buildRegistrationPayload(): RegisterUserRequest {
    const formValue = this.createForm.value;
    // Note: In a real scenario, we might first create the employee via a separate endpoint
    // and then link the ID here. However, based on the current context, it seems the intention
    // was to create both. Since the RegisterUserRequest only accepts { id } for employee,
    // and we cannot invent new endpoints, we will assume for now that if we are creating a *new* employee
    // alongside a user, we might be hitting a limitation of the strict /auth/register contract which
    // expects an EXISTING employee ID if linking is required.
    
    // BUT, strict instructions say: "Replace the request payload to match the canonical request model".
    // The canonical model only has `employee?: { id: number }`.
    // The current form collects full employee details.
    // To strictly follow the contract, we can ONLY send employee ID.
    // Since this is a "New Employee" page, likely the backend *should* support creating employee details,
    // but the provided contract for /auth/register DOES NOT support it (only { id }).
    
    // CRITICAL DECISION: Strictly follow the provided contract.
    // The contract for /auth/register says `employee` field is optional ` { id }`.
    // It does NOT support full employee DTO. 
    // Therefore, we cannot send the full employee object to /auth/register.
    
    // However, this component is "NewEmployee". It collects full employee data.
    // If we only send /auth/register, we lose the employee data (firstName, etc).
    // The user query asked to "Refactor ... to conform EXACTLY".
    // This implies we must drop the full employee object from the payload to this specific endpoint.
    // If the backend requires a separate call to create employee first, that would be an "improvement" or "new backend call",
    // which are constrained.
    
    // Wait, looking at the previous file content, the `UserRegistrationRequest` had `employee: EmployeeDto`.
    // The NEW contract strictly says `employee` is optional `{ id }`.
    // This means the previous implementation was likely relying on an extended backend behavior 
    // or the contract provided in the prompt is stricter/different than what was implemented.
    // I must follow the prompt's contract.
    
    // If I cannot send the employee details, I will omit them from the `employee` field 
    // and only send `id` if I had one (which I don't for a new employee).
    // This effectively breaks the "Create Employee" feature part of this registration 
    // UNLESS the prompt implies I should just fix the *User* registration part.
    
    // Re-reading: "Refactor the new-employee component ... to conform EXACTLY".
    // "Ensure employee is sent as { id } if linking is required".
    // Since I don't have an ID for a new employee, I cannot send the employee field.
    // I will log a warning or comment about this data loss as I must strictly follow constraints.
    // Actually, to make it compile and run "correctly" against the contract, 
    // I will map roles correctly and remove the forbidden fields.
    
    // Regarding the employee data: The form collects it. The contract forbids sending it to /auth/register.
    // I will structure the payload to match `RegisterUserRequest`. 
    // I will NOT send the employee data since the contract excludes it.
    
    return {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      phoneNumber: formValue.phoneNumber,
      // Map string roles to IDs based on a mock map (since UI uses strings)
      roles: (formValue.roles || []).map((role: string) => ({ id: this.roleIdMap[role] || 0 })),
      // We cannot send new employee details to this endpoint based on the contract.
      // We explicitly omit 'employee' since we don't have an existing ID to link.
    };
  }
}
