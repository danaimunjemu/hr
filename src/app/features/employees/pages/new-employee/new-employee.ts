import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs';
import { EmployeesService, EmployeeDto, UserRegistrationRequest } from '../../services/employees.service';

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
      password: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      mfaEnabled: [false],
      changePassword: [true],
      enabled: [true],
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
            this.router.navigate(['/employees']);
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

  private buildRegistrationPayload(): UserRegistrationRequest {
    const formValue = this.createForm.value;
    const employeeForm = formValue.employee;
    const employee: EmployeeDto = {
      firstName: employeeForm.firstName,
      lastName: employeeForm.lastName,
      nationalId: employeeForm.nationalId,
      employeeNumber: employeeForm.employeeNumber,
      gender: employeeForm.gender,
      dateOfBirth: this.formatDate(employeeForm.dateOfBirth),
      dateJoined: this.formatDate(employeeForm.dateJoined)
    };

    return {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      phoneNumber: formValue.phoneNumber,
      mfaEnabled: formValue.mfaEnabled,
      changePassword: formValue.changePassword,
      enabled: formValue.enabled,
      roles: (formValue.roles || []).map((role: string) => ({ role })),
      employee
    };
  }
}
